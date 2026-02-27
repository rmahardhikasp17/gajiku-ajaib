#!/bin/bash
# ============================================================
# GAJIKU — Generate Android Release Keystore
# Jalankan sekali saja. Simpan file .jks di tempat aman!
# ============================================================
# 
# Cara pakai (di Git Bash / WSL / Mac / Linux):
#   chmod +x generate-keystore.sh
#   ./generate-keystore.sh
#
# Atau di Windows PowerShell (butuh Java terinstall):
#   Jalankan perintah keytool secara manual (lihat di bawah)
# ============================================================

set -e

echo "🔐 GAJIKU — Android Release Keystore Generator"
echo "================================================"
echo ""
echo "⚠️  PENTING:"
echo "   - Simpan file .jks ini di tempat AMAN"
echo "   - JANGAN commit ke Git"
echo "   - JANGAN kehilangan file ini (tidak bisa recover!)"
echo ""

# Konfigurasi (ubah sesuai kebutuhan)
KEYSTORE_FILE="gajiku-release.jks"
KEY_ALIAS="gajiku"
VALIDITY_DAYS=10000    # ~27 tahun
STORE_PASS="changeme_store_password_123"    # GANTI INI!
KEY_PASS="changeme_key_password_123"        # GANTI INI!

# Info sertifikat
DNAME="CN=GAJIKU App, OU=Mobile, O=GAJIKU, L=Jakarta, ST=DKI Jakarta, C=ID"

keytool -genkeypair \
  -v \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "$VALIDITY_DAYS" \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "$DNAME"

echo ""
echo "✅ Keystore dibuat: $KEYSTORE_FILE"
echo ""
echo "📋 Langkah selanjutnya — Upload ke GitHub Secrets:"
echo "   Repo → Settings → Secrets and variables → Actions → New secret"
echo ""
echo "   1. KEYSTORE_BASE64"
echo "      Nilai: $(base64 -w 0 $KEYSTORE_FILE)"
echo ""
echo "   2. KEYSTORE_PASSWORD"
echo "      Nilai: $STORE_PASS"  
echo ""
echo "   3. KEY_ALIAS"
echo "      Nilai: $KEY_ALIAS"
echo ""
echo "   4. KEY_PASSWORD"
echo "      Nilai: $KEY_PASS"
echo ""
echo "⚠️  Ganti password default sebelum digunakan di production!"
