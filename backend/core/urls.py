from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.api_v1_urls')),
    path('api/v1/', include('core.api_v1_urls')),
    path('api/', include('sickbay.urls')),
    path('api/', include('library.urls')),
]
