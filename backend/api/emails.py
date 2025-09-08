from django.conf import settings
from django.core.mail import send_mail, mail_admins


def _safe_send(func, *args, **kwargs):
    try:
        func(*args, **kwargs)
    except Exception:
        # In production, you might log this
        pass


def notify_admins_verification_submitted(app_user, access_request=None):
    subject = f"New verification submitted: {app_user.email}"
    message = (
        f"A user has submitted verification.\n\n"
        f"Name: {app_user.name}\n"
        f"Email: {app_user.email}\n"
        f"Status: {app_user.status}\n"
        f"Role: {app_user.role}\n"
    )
    _safe_send(mail_admins, subject, message, fail_silently=True)


def email_user_verification_received(app_user):
    if not app_user.email:
        return
    subject = "Verification received"
    message = (
        "Hello,\n\n"
        "We received your identity verification submission. "
        "An administrator will review it shortly. You will be notified once approved or if we need more information.\n\n"
        "Thank you."
    )
    _safe_send(
        send_mail,
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [app_user.email],
        fail_silently=True,
    )


def email_user_approved(app_user):
    if not app_user.email:
        return
    subject = "Access approved"
    message = (
        f"Hello {app_user.name},\n\n"
        "Your account has been approved. You can now sign in and access the system.\n\n"
        "Thank you."
    )
    _safe_send(
        send_mail,
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [app_user.email],
        fail_silently=True,
    )


def email_user_rejected(app_user, note: str = ""):
    if not app_user.email:
        return
    subject = "Access request update"
    body_note = f"\n\nNote from reviewer:\n{note}" if note else ""
    message = (
        f"Hello {app_user.name},\n\n"
        "Your access request was not approved at this time." + body_note + "\n\n"
        "You may contact support for more information or resubmit if applicable."
    )
    _safe_send(
        send_mail,
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [app_user.email],
        fail_silently=True,
    )

