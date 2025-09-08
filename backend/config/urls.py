from django.urls import include, path
from django.contrib import admin
from django.views.generic import RedirectView

urlpatterns = [
    # Redirect the root path to a simple health endpoint to avoid 404s
    path("", RedirectView.as_view(url="/api/health/", permanent=False), name="root"),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("accounts/", include("allauth.urls")),
]
