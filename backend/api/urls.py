from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("auth/login", views.auth_login, name="auth_login"),
    path("auth/logout", views.auth_logout, name="auth_logout"),
    path("auth/register", views.auth_register, name="auth_register"),
    path("auth/forgot-password", views.forgot_password, name="forgot_password"),
    path("auth/reset-password", views.reset_password, name="reset_password"),
    path("auth/refresh-token", views.refresh_token, name="refresh_token"),
    path("auth/google", views.auth_google, name="auth_google"),
    path("auth/me", views.auth_me, name="auth_me"),

    # Verification endpoints
    path("verify/status", views.verify_status, name="verify_status"),
    path("verify/upload", views.verify_upload, name="verify_upload"),
    path("verify/requests", views.verify_requests, name="verify_requests"),
    path("verify/approve", views.verify_approve, name="verify_approve"),
    path("verify/reject", views.verify_reject, name="verify_reject"),
    path("verify/headshot/<uuid:request_id>", views.verify_headshot, name="verify_headshot"),

    # Menu endpoints
    path("menu/items", views.menu_items, name="menu_items"),
    path("menu/items/<str:item_id>", views.menu_item_detail, name="menu_item_detail"),
    path("menu/items/<str:item_id>/availability", views.menu_item_availability, name="menu_item_availability"),
    path("menu/items/<str:item_id>/image", views.menu_item_image, name="menu_item_image"),

    # Users endpoints
    path("users", views.users, name="users"),
    path("users/<str:user_id>", views.user_detail, name="user_detail"),
    path("users/<str:user_id>/status", views.user_status, name="user_status"),
    path("users/<str:user_id>/role", views.user_role, name="user_role"),
    path("users/roles", views.user_roles, name="user_roles"),
    path("users/roles/<str:value>", views.user_role_config, name="user_role_config"),
]
