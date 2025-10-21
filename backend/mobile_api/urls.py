from django.urls import include, path
from rest_framework.routers import DefaultRouter

from mobile_api.accounts.views import (
    BiometricEnrollmentView,
    BiometricSessionView,
    PasswordResetRequestView,
    LogoutView,
    MeView,
    RefreshTokenView,
    RegistrationView,
    SessionView,
    AvatarUploadView,
)
from mobile_api.inventory.views import InventoryItemViewSet
from mobile_api.orders.views import OrderViewSet
from mobile_api.payments.views import PaymentTransactionViewSet

router = DefaultRouter(trailing_slash=False)
router.register("inventory/items", InventoryItemViewSet, basename="inventory-items")
router.register("orders", OrderViewSet, basename="orders")
router.register("payments/transactions", PaymentTransactionViewSet, basename="payment-transactions")

urlpatterns = [
    path("auth/login", SessionView.as_view(), name="mobile-auth-login"),
    path("auth/logout", LogoutView.as_view(), name="mobile-auth-logout"),
    path("auth/refresh", RefreshTokenView.as_view(), name="mobile-auth-refresh"),
    path("auth/register", RegistrationView.as_view(), name="mobile-auth-register"),
    path(
        "auth/password-reset/request",
        PasswordResetRequestView.as_view(),
        name="mobile-auth-password-reset-request",
    ),
    path("auth/biometric/login", BiometricSessionView.as_view(), name="mobile-auth-biometric-login"),
    path("auth/biometric/register", BiometricEnrollmentView.as_view(), name="mobile-auth-biometric-register"),
    path("users/me", MeView.as_view(), name="mobile-users-me"),
    path("users/avatar", AvatarUploadView.as_view(), name="mobile-users-avatar"),
    path("", include(router.urls)),
]
