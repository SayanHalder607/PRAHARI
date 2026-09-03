"""
Security tests for PRAHARI
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert "status" in response.json()
    
def test_login_required():
    """Test that protected endpoints require authentication"""
    response = client.get("/api/dashboard/commander")
    assert response.status_code == 401
    
def test_rbac_enforcement():
    """Test Role-Based Access Control"""
    # Login as personnel
    login_response = client.post("/api/auth/login", 
                                json={"username": "personnel1", "password": "demo123"})
    personnel_token = login_response.json()["access_token"]
    
    # Try to access commander endpoint as personnel
    response = client.get("/api/dashboard/commander", 
                         headers={"Authorization": f"Bearer {personnel_token}"})
    assert response.status_code == 403
    
def test_privacy_protection():
    """Test that sensitive data is properly protected"""
    # Attempt to access other personnel's data without authorization
    response = client.get("/api/personnel/other-person-id/psi",
                         headers={"Authorization": "Bearer invalid-token"})
    assert response.status_code == 401