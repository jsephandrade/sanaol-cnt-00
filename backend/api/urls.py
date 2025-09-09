from django.urls import path
from . import views_auth as auth_views
from . import views_verify as verify_views
from . import views_menu as menu_views
from . import views_users as user_views

urlpatterns = [
    path("health/", auth_views.health, name="health"),
    path("auth/login", auth_views.auth_login, name="auth_login"),
    path("auth/logout", auth_views.auth_logout, name="auth_logout"),
    path("auth/register", auth_views.auth_register, name="auth_register"),
    path("auth/verify-email", auth_views.verify_email, name="verify_email"),
    path("auth/resend-verification", auth_views.resend_verification, name="resend_verification"),
    path("auth/forgot-password", auth_views.forgot_password, name="forgot_password"),
    path("auth/resend-reset", auth_views.forgot_password, name="resend_reset"),
    path("auth/reset-password", auth_views.reset_password, name="reset_password"),
    path("auth/reset-password-code", auth_views.reset_password_code, name="reset_password_code"),
    path("auth/verify-reset-code", auth_views.verify_reset_code, name="verify_reset_code"),
    path("auth/change-password", auth_views.change_password, name="change_password"),
    path("auth/refresh-token", auth_views.refresh_token, name="refresh_token"),
    path("auth/google", auth_views.auth_google, name="auth_google"),
    path("auth/me", auth_views.auth_me, name="auth_me"),

    # Verification endpoints
    path("verify/status", verify_views.verify_status, name="verify_status"),
    path("verify/upload", verify_views.verify_upload, name="verify_upload"),
    path("verify/resend-token", verify_views.verify_resend_token, name="verify_resend_token"),
    path("verify/requests", verify_views.verify_requests, name="verify_requests"),
    path("verify/approve", verify_views.verify_approve, name="verify_approve"),
    path("verify/reject", verify_views.verify_reject, name="verify_reject"),
    path("verify/headshot/<uuid:request_id>", verify_views.verify_headshot, name="verify_headshot"),

    # Menu endpoints
    path("menu/items", menu_views.menu_items, name="menu_items"),
    path("menu/items/<str:item_id>", menu_views.menu_item_detail, name="menu_item_detail"),
    path("menu/items/<str:item_id>/availability", menu_views.menu_item_availability, name="menu_item_availability"),
    path("menu/items/<str:item_id>/image", menu_views.menu_item_image, name="menu_item_image"),

    # Users endpoints
    path("users", user_views.users, name="users"),
    path("users/<str:user_id>", user_views.user_detail, name="user_detail"),
    path("users/<str:user_id>/status", user_views.user_status, name="user_status"),
    path("users/<str:user_id>/role", user_views.user_role, name="user_role"),
    path("users/roles", user_views.user_roles, name="user_roles"),
    path("users/roles/<str:value>", user_views.user_role_config, name="user_role_config"),
]
