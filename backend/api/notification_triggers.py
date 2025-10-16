"""
Notification triggers for business events.
These functions create notifications when certain events occur.
"""

import logging
from typing import List, Optional
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.db.models import F, Q
from django.utils import timezone

from .notification_templates import format_notification
from .tasks import create_notification

logger = logging.getLogger(__name__)

User = get_user_model()


def get_admin_users() -> List[int]:
    """Get all admin and manager user IDs"""
    try:
        admin_users = User.objects.filter(
            Q(role='admin') | Q(role='manager')
        ).values_list('id', flat=True)
        return list(admin_users)
    except Exception as e:
        logger.error(f"Failed to get admin users: {e}")
        return []


# ========== Inventory Triggers ==========

def trigger_low_stock_alert(item):
    """
    Trigger low stock alert notification.

    Args:
        item: InventoryItem instance
    """
    try:
        if item.stock_quantity <= item.reorder_level:
            notification_data = format_notification(
                'low_stock_alert',
                item_name=item.name,
                current_stock=item.stock_quantity,
                unit=item.unit or 'units',
                reorder_level=item.reorder_level
            )

            # Notify all admins and managers
            for user_id in get_admin_users():
                create_notification.delay(
                    user_id=user_id,
                    title=notification_data['title'],
                    message=notification_data['message'],
                    notification_type=notification_data['type'],
                    meta={'item_id': str(item.id), 'event_type': 'low_stock'}
                )

            logger.info(f"Low stock alert triggered for item {item.name}")

    except Exception as e:
        logger.error(f"Failed to trigger low stock alert: {e}")


def trigger_out_of_stock(item):
    """
    Trigger out of stock notification.

    Args:
        item: InventoryItem instance
    """
    try:
        if item.stock_quantity <= 0:
            notification_data = format_notification(
                'out_of_stock',
                item_name=item.name
            )

            # Notify all admins and managers
            for user_id in get_admin_users():
                create_notification.delay(
                    user_id=user_id,
                    title=notification_data['title'],
                    message=notification_data['message'],
                    notification_type=notification_data['type'],
                    meta={'item_id': str(item.id), 'event_type': 'out_of_stock'}
                )

            logger.info(f"Out of stock notification triggered for item {item.name}")

    except Exception as e:
        logger.error(f"Failed to trigger out of stock notification: {e}")


def check_expiring_items():
    """
    Check for items expiring soon and trigger notifications.
    Should be run daily via Celery beat.
    """
    try:
        from .models import InventoryItem

        # Items expiring in the next 7 days
        expiry_threshold = timezone.now() + timedelta(days=7)

        expiring_items = InventoryItem.objects.filter(
            expiry_date__lte=expiry_threshold,
            expiry_date__gte=timezone.now(),
            status='active'
        )

        if expiring_items.exists():
            notification_data = format_notification(
                'item_expiring_soon',
                count=expiring_items.count(),
                days=7
            )

            # Notify all admins and managers
            for user_id in get_admin_users():
                create_notification.delay(
                    user_id=user_id,
                    title=notification_data['title'],
                    message=notification_data['message'],
                    notification_type=notification_data['type'],
                    meta={'event_type': 'items_expiring_soon', 'item_count': expiring_items.count()}
                )

            logger.info(f"Expiring items notification triggered for {expiring_items.count()} items")

    except Exception as e:
        logger.error(f"Failed to check expiring items: {e}")


# ========== Order Triggers ==========

def trigger_new_order(order):
    """
    Trigger new order notification.

    Args:
        order: Order instance
    """
    try:
        notification_data = format_notification(
            'new_order',
            order_number=order.id,
            total_amount=f"{order.total_amount:,.2f}" if order.total_amount else "0.00",
            item_count=order.items.count() if hasattr(order, 'items') else 0
        )

        # Notify all admins and managers
        for user_id in get_admin_users():
            create_notification.delay(
                user_id=user_id,
                title=notification_data['title'],
                message=notification_data['message'],
                notification_type=notification_data['type'],
                meta={'order_id': str(order.id), 'event_type': 'new_order'}
            )

        logger.info(f"New order notification triggered for order {order.id}")

    except Exception as e:
        logger.error(f"Failed to trigger new order notification: {e}")


def trigger_order_completed(order):
    """
    Trigger order completed notification.

    Args:
        order: Order instance
    """
    try:
        notification_data = format_notification(
            'order_completed',
            order_number=order.id,
            total_amount=f"{order.total_amount:,.2f}" if order.total_amount else "0.00"
        )

        # Notify all admins and managers
        for user_id in get_admin_users():
            create_notification.delay(
                user_id=user_id,
                title=notification_data['title'],
                message=notification_data['message'],
                notification_type=notification_data['type'],
                meta={'order_id': str(order.id), 'event_type': 'order_completed'}
            )

        logger.info(f"Order completed notification triggered for order {order.id}")

    except Exception as e:
        logger.error(f"Failed to trigger order completed notification: {e}")


# ========== Payment Triggers ==========

def trigger_payment_received(order, amount, payment_method):
    """
    Trigger payment received notification.

    Args:
        order: Order instance
        amount: Payment amount
        payment_method: Payment method used
    """
    try:
        notification_data = format_notification(
            'payment_received',
            amount=f"{amount:,.2f}",
            order_number=order.id,
            payment_method=payment_method
        )

        # Notify all admins and managers
        for user_id in get_admin_users():
            create_notification.delay(
                user_id=user_id,
                title=notification_data['title'],
                message=notification_data['message'],
                notification_type=notification_data['type'],
                meta={'order_id': str(order.id), 'event_type': 'payment_received', 'amount': str(amount)}
            )

        logger.info(f"Payment received notification triggered for order {order.id}")

    except Exception as e:
        logger.error(f"Failed to trigger payment received notification: {e}")


# ========== Catering Triggers ==========

def trigger_catering_booking(event):
    """
    Trigger catering booking notification.

    Args:
        event: CateringEvent instance
    """
    try:
        template_name = 'catering_booking_confirmed' if event.status == 'confirmed' else 'catering_booking_pending'

        notification_data = format_notification(
            template_name,
            event_name=event.event_name or 'Unnamed Event',
            event_date=event.event_date.strftime('%B %d, %Y') if event.event_date else 'TBD',
            total_amount=f"{event.total_amount:,.2f}" if event.total_amount else "0.00"
        )

        # Notify all admins and managers
        for user_id in get_admin_users():
            create_notification.delay(
                user_id=user_id,
                title=notification_data['title'],
                message=notification_data['message'],
                notification_type=notification_data['type'],
                meta={'event_id': str(event.id), 'event_type': 'catering_booking'}
            )

        logger.info(f"Catering booking notification triggered for event {event.id}")

    except Exception as e:
        logger.error(f"Failed to trigger catering booking notification: {e}")


def trigger_catering_status_change(event, old_status):
    """
    Trigger notification when catering event status changes.

    Args:
        event: CateringEvent instance
        old_status: Previous status
    """
    try:
        if event.status == 'confirmed' and old_status != 'confirmed':
            notification_data = format_notification(
                'catering_booking_confirmed',
                event_name=event.event_name or 'Unnamed Event',
                event_date=event.event_date.strftime('%B %d, %Y') if event.event_date else 'TBD',
                total_amount=f"{event.total_amount:,.2f}" if event.total_amount else "0.00"
            )
        elif event.status == 'cancelled':
            notification_data = format_notification(
                'catering_booking_cancelled',
                event_name=event.event_name or 'Unnamed Event',
                event_date=event.event_date.strftime('%B %d, %Y') if event.event_date else 'TBD'
            )
        else:
            return  # No notification for other status changes

        # Notify all admins and managers
        for user_id in get_admin_users():
            create_notification.delay(
                user_id=user_id,
                title=notification_data['title'],
                message=notification_data['message'],
                notification_type=notification_data['type'],
                meta={'event_id': str(event.id), 'event_type': 'catering_status_change', 'old_status': old_status}
            )

        logger.info(f"Catering status change notification triggered for event {event.id}")

    except Exception as e:
        logger.error(f"Failed to trigger catering status change notification: {e}")


# ========== Employee Triggers ==========

def trigger_shift_assigned(employee, schedule):
    """
    Trigger shift assigned notification.

    Args:
        employee: Employee instance
        schedule: Schedule instance
    """
    try:
        notification_data = format_notification(
            'shift_assigned',
            day=schedule.day,
            start_time=schedule.start_time.strftime('%I:%M %p') if schedule.start_time else 'TBD',
            end_time=schedule.end_time.strftime('%I:%M %p') if schedule.end_time else 'TBD'
        )

        # Notify the employee (if they have a user account)
        if hasattr(employee, 'user_id') and employee.user_id:
            create_notification.delay(
                user_id=employee.user_id,
                title=notification_data['title'],
                message=notification_data['message'],
                notification_type=notification_data['type'],
                meta={'schedule_id': str(schedule.id), 'event_type': 'shift_assigned'}
            )

            logger.info(f"Shift assigned notification triggered for employee {employee.id}")

    except Exception as e:
        logger.error(f"Failed to trigger shift assigned notification: {e}")


def trigger_leave_status_change(leave_request):
    """
    Trigger notification when leave request status changes.

    Args:
        leave_request: LeaveRequest instance
    """
    try:
        if leave_request.status == 'approved':
            template_name = 'leave_approved'
        elif leave_request.status == 'rejected':
            template_name = 'leave_rejected'
        else:
            return  # No notification for pending status

        notification_data = format_notification(
            template_name,
            start_date=leave_request.start_date.strftime('%B %d, %Y') if leave_request.start_date else 'TBD',
            end_date=leave_request.end_date.strftime('%B %d, %Y') if leave_request.end_date else 'TBD',
            reason=leave_request.rejection_reason or 'N/A'
        )

        # Notify the employee (if they have a user account)
        if hasattr(leave_request, 'employee') and hasattr(leave_request.employee, 'user_id'):
            if leave_request.employee.user_id:
                create_notification.delay(
                    user_id=leave_request.employee.user_id,
                    title=notification_data['title'],
                    message=notification_data['message'],
                    notification_type=notification_data['type'],
                    meta={'leave_request_id': str(leave_request.id), 'event_type': 'leave_status_change'}
                )

                logger.info(f"Leave status change notification triggered for leave request {leave_request.id}")

    except Exception as e:
        logger.error(f"Failed to trigger leave status change notification: {e}")
