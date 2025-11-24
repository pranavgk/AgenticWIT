import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

/**
 * E2E tests for authentication flow
 * Tests the complete user journey including accessibility compliance
 */

const API_URL = 'http://localhost:3001';

// Generate unique test user
const generateTestUser = () => ({
  email: `e2e-test-${Date.now()}@example.com`,
  username: `e2euser${Date.now()}`,
  password: 'Test123!@#Secure',
  firstName: 'E2E',
  lastName: 'Test',
});

test.describe('Authentication API E2E Tests', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let accessToken: string;
  let refreshToken: string;

  test.beforeEach(() => {
    testUser = generateTestUser();
  });

  test('complete authentication flow', async ({ request }) => {
    // 1. Register new user
    const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: testUser,
    });

    expect(registerResponse.status()).toBe(201);
    const registerData = await registerResponse.json();
    expect(registerData.success).toBe(true);
    expect(registerData.data.user.email).toBe(testUser.email);
    expect(registerData.data.accessToken).toBeTruthy();
    expect(registerData.data.refreshToken).toBeTruthy();

    accessToken = registerData.data.accessToken;
    refreshToken = registerData.data.refreshToken;

    // 2. Get user profile
    const profileResponse = await request.get(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(profileResponse.status()).toBe(200);
    const profileData = await profileResponse.json();
    expect(profileData.data.email).toBe(testUser.email);
    expect(profileData.data.password).toBeUndefined();

    // 3. Update profile
    const updateResponse = await request.patch(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        firstName: 'Updated',
        accessibilityPreferences: {
          theme: 'dark',
          fontSize: 'large',
        },
      },
    });

    expect(updateResponse.status()).toBe(200);
    const updateData = await updateResponse.json();
    expect(updateData.data.firstName).toBe('Updated');

    // 4. Refresh token
    const refreshResponse = await request.post(`${API_URL}/api/auth/refresh`, {
      data: { refreshToken },
    });

    expect(refreshResponse.status()).toBe(200);
    const refreshData = await refreshResponse.json();
    expect(refreshData.data.accessToken).toBeTruthy();
    expect(refreshData.data.refreshToken).toBeTruthy();
    expect(refreshData.data.refreshToken).not.toBe(refreshToken); // Token rotation

    accessToken = refreshData.data.accessToken;
    refreshToken = refreshData.data.refreshToken;

    // 5. Change password
    const changePasswordResponse = await request.post(`${API_URL}/api/users/me/password`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        currentPassword: testUser.password,
        newPassword: 'NewPassword123!@#',
      },
    });

    expect(changePasswordResponse.status()).toBe(200);

    // 6. Login with new password
    const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: 'NewPassword123!@#',
      },
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData.data.accessToken).toBeTruthy();

    accessToken = loginData.data.accessToken;

    // 7. Logout
    const logoutResponse = await request.post(`${API_URL}/api/auth/logout`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: { refreshToken },
    });

    expect(logoutResponse.status()).toBe(200);

    // 8. Verify token is invalidated
    const invalidTokenResponse = await request.post(`${API_URL}/api/auth/refresh`, {
      data: { refreshToken },
    });

    expect(invalidTokenResponse.status()).toBe(401);
  });

  test('registration validation errors', async ({ request }) => {
    // Test weak password
    const weakPasswordResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        ...testUser,
        password: 'weak',
      },
    });
    expect(weakPasswordResponse.status()).toBe(400);

    // Test invalid email
    const invalidEmailResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        ...testUser,
        email: 'invalid-email',
      },
    });
    expect(invalidEmailResponse.status()).toBe(400);

    // Test missing fields
    const missingFieldsResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        email: testUser.email,
        // Missing required fields
      },
    });
    expect(missingFieldsResponse.status()).toBe(400);
  });

  test('authentication security checks', async ({ request }) => {
    // Register user first
    await request.post(`${API_URL}/api/auth/register`, {
      data: testUser,
    });

    // Test invalid credentials
    const invalidLoginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: 'WrongPassword123!',
      },
    });
    expect(invalidLoginResponse.status()).toBe(401);

    // Test accessing protected route without token
    const noTokenResponse = await request.get(`${API_URL}/api/users/me`);
    expect(noTokenResponse.status()).toBe(401);

    // Test with invalid token
    const invalidTokenResponse = await request.get(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: 'Bearer invalid-token-here',
      },
    });
    expect(invalidTokenResponse.status()).toBe(401);
  });

  test('accessibility preferences persistence', async ({ request }) => {
    // Register user
    const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: testUser,
    });
    const registerData = await registerResponse.json();
    accessToken = registerData.data.accessToken;

    // Set accessibility preferences
    const preferences = {
      accessibilityPreferences: {
        theme: 'high-contrast',
        fontSize: 'extra-large',
        reduceMotion: true,
        screenReaderMode: true,
        keyboardNavOnly: true,
      },
    };

    await request.patch(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: preferences,
    });

    // Verify preferences are saved
    const profileResponse = await request.get(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();
    expect(profileData.data.accessibilityPreferences).toMatchObject({
      theme: 'high-contrast',
      fontSize: 'extra-large',
      reduceMotion: true,
      screenReaderMode: true,
      keyboardNavOnly: true,
    });
  });
});

test.describe('API Health Checks', () => {
  test('health endpoint is accessible', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeTruthy();
  });

  test('API info endpoint is accessible', async ({ request }) => {
    const response = await request.get(`${API_URL}/api`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.name).toBe('AgenticWIT API');
    expect(data.endpoints).toBeDefined();
  });
});
