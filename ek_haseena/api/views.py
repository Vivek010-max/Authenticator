from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import process_certificate, generate_keys
import os

# -------------------------
# Issue Certificate
# -------------------------
@api_view(["POST"])
def issue_document(request):
    """
    Issue new certificate by processing uploaded image.
    """
    file = request.FILES.get("image")
    if not file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.name)
        with open(file_path, "wb") as f:
            for chunk in file.chunks():
                f.write(chunk)

        generate_keys()
        process_certificate(file_path, issue=True)

        return Response({
            "status": "success",
            "message": "Certificate issued and added to blockchain"
        })

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------------
# Verify Certificate
# -------------------------
@api_view(["POST"])
def verify_document(request):
    """
    Verify uploaded certificate against blockchain.
    """
    file = request.FILES.get("image")
    if not file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.name)
        with open(file_path, "wb") as f:
            for chunk in file.chunks():
                f.write(chunk)

        generate_keys()
        process_certificate(file_path, issue=False)

        return Response({
            "status": "success",
            "message": "Verification process completed (check logs/terminal for details)"
        })

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
