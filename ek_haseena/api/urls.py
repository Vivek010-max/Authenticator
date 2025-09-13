from django.urls import path
from . import views

urlpatterns = [
    path("issue_certificate/", views.issue_document, name="issue"),
    path("verify_certificate/", views.verify_document, name="verify"),
]
