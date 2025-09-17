Permissions and Roles

Roles

- admin: wildcard access (all)
- manager: elevated operational permissions across inventory, orders, payments, scheduling, reports
- staff: daily operations: place orders, update statuses, process payments, view records

Permission Map (subset)

- account.login, account.logout, account.password.edit, account.info.edit, account.biometric
- inventory.view, inventory.update, inventory.expiry.track, inventory.menu.manage, inventory.lowstock.alerts, inventory.restock.manage
- order.place, order.status.view, order.queue.handle, order.status.update, order.bulk.track
- payment.process, payment.records.view, payment.refund
- schedule.view_edit, schedule.manage, attendance.manage, leave.manage
- reports.sales.view, reports.inventory.view, reports.orders.view, reports.staff.view, reports.customer.view
- notification.send, notification.receive, notification.view
- menu.manage, employees.manage, verify.review

Notes

- Server enforces RBAC; frontend uses the same map for UI gating (src/lib/permissions.js).
- Admin has wildcard `all`.
- Explicit per-user permissions are unioned with role defaults in both backend and frontend.

Details

- Staff schedule access: `schedule.view_edit` allows viewing schedule and editing own entries. Creating/updating/deleting entries for other employees requires `schedule.manage` (granted to manager/admin by default).
- Manager schedule access: `schedule.manage` allows creating/updating/deleting schedule entries for any employee. Managers also have `schedule.view_edit` for parity in UI.
