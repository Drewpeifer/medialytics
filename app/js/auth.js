/**
 * Plex OAuth Authentication Module
 * Handles user authentication using Plex OAuth flow
 * Based on: https://forums.plex.tv/t/authenticating-with-plex/609370
 */

const PlexAuth = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        appName: 'Medialytics',
        plexAuthUrl: 'https://app.plex.tv/auth',
        plexPinUrl: 'https://plex.tv/api/v2/pins',
        plexUserUrl: 'https://plex.tv/api/v2/user',
        plexResourcesUrl: 'https://plex.tv/api/v2/resources',
        storageKeys: {
            clientId: 'medialytics_client_id',
            authToken: 'medialytics_auth_token',
            tokenTimestamp: 'medialytics_token_timestamp',
            userInfo: 'medialytics_user_info',
            selectedServer: 'medialytics_selected_server'
        },
        pollInterval: 1000, // 1 second
        pollTimeout: 300000 // 5 minutes
    };

    /**
     * Generate or retrieve client identifier (UUID v4)
     * @returns {string} Client identifier
     */
    function getClientIdentifier() {
        let clientId = localStorage.getItem(CONFIG.storageKeys.clientId);
        
        if (!clientId) {
            // Generate UUID v4
            clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            localStorage.setItem(CONFIG.storageKeys.clientId, clientId);
        }
        
        return clientId;
    }

    /**
     * Generate PIN from Plex API
     * @returns {Promise<{id: number, code: string}>} PIN information
     */
    async function generatePin() {
        const clientId = getClientIdentifier();
        
        try {
            const response = await axios.post(CONFIG.plexPinUrl, null, {
                headers: {
                    'accept': 'application/json',
                    'X-Plex-Product': CONFIG.appName,
                    'X-Plex-Client-Identifier': clientId
                }
            });
            
            // Return the full code as provided by Plex API
            return {
                id: response.data.id,
                code: response.data.code
            };
        } catch (error) {
            console.error('Failed to generate PIN:', error);
            throw new Error('Failed to generate authentication PIN. Please try again.');
        }
    }

    /**
     * Get Plex PIN link URL for manual authentication
     * For polling method, users manually enter the PIN at plex.tv/link
     * @returns {string} Plex link URL
     */
    function getPlexLinkUrl() {
        return 'https://plex.tv/link';
    }

    /**
     * Check PIN status (for polling method)
     * @param {number} pinId - PIN ID from generatePin()
     * @returns {Promise<string|null>} Auth token if claimed, null otherwise
     */
    async function checkPinStatus(pinId) {
        const clientId = getClientIdentifier();
        
        try {
            const response = await axios.get(`${CONFIG.plexPinUrl}/${pinId}`, {
                headers: {
                    'accept': 'application/json',
                    'X-Plex-Client-Identifier': clientId
                }
            });
            
            return response.data.authToken || null;
        } catch (error) {
            console.error('Failed to check PIN status:', error);
            return null;
        }
    }

    /**
     * Poll for PIN claim (alternative to forwarding method)
     * @param {number} pinId - PIN ID from generatePin()
     * @returns {Promise<string>} Auth token when claimed
     */
    function pollForToken(pinId) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const pollInterval = setInterval(async () => {
                // Check timeout
                if (Date.now() - startTime > CONFIG.pollTimeout) {
                    clearInterval(pollInterval);
                    reject(new Error('Authentication timeout. Please try again.'));
                    return;
                }
                
                // Check PIN status
                const token = await checkPinStatus(pinId);
                if (token) {
                    clearInterval(pollInterval);
                    resolve(token);
                }
            }, CONFIG.pollInterval);
        });
    }

    /**
     * Validate token by checking user info
     * @param {string} token - Plex auth token
     * @returns {Promise<Object|null>} User info if valid, null otherwise
     */
    async function validateToken(token) {
        if (!token) return null;
        
        try {
            const response = await axios.get(CONFIG.plexUserUrl, {
                headers: {
                    'accept': 'application/json',
                    'X-Plex-Token': token
                }
            });
            
            return {
                id: response.data.id,
                username: response.data.username || response.data.email,
                email: response.data.email,
                thumb: response.data.thumb
            };
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.warn('Token is invalid or expired');
                return null;
            }
            console.error('Failed to validate token:', error);
            return null;
        }
    }

    /**
     * Store authentication token and user info
     * @param {string} token - Plex auth token
     * @param {Object} userInfo - User information
     */
    function storeToken(token, userInfo) {
        localStorage.setItem(CONFIG.storageKeys.authToken, token);
        localStorage.setItem(CONFIG.storageKeys.tokenTimestamp, new Date().toISOString());
        if (userInfo) {
            localStorage.setItem(CONFIG.storageKeys.userInfo, JSON.stringify(userInfo));
        }
    }

    /**
     * Get stored authentication token
     * @returns {string|null} Stored token or null
     */
    function getStoredToken() {
        return localStorage.getItem(CONFIG.storageKeys.authToken);
    }

    /**
     * Get stored user info
     * @returns {Object|null} User info or null
     */
    function getStoredUserInfo() {
        const userInfoStr = localStorage.getItem(CONFIG.storageKeys.userInfo);
        if (!userInfoStr) return null;
        
        try {
            return JSON.parse(userInfoStr);
        } catch (error) {
            console.error('Failed to parse user info:', error);
            return null;
        }
    }

    /**
     * Clear all authentication data (logout)
     */
    function clearAuth() {
        localStorage.removeItem(CONFIG.storageKeys.authToken);
        localStorage.removeItem(CONFIG.storageKeys.tokenTimestamp);
        localStorage.removeItem(CONFIG.storageKeys.userInfo);
    }

    /**
     * Normalize boolean values from Plex API (handles 1/true)
     * @param {*} value - Value to normalize
     * @returns {boolean} Normalized boolean
     */
    function normalizeBoolean(value) {
        return value === true || value === 1;
    }

    /**
     * Check if resource is an online server
     * @param {Object} resource - Plex resource object
     * @returns {boolean} True if resource is an online server
     */
    function isOnlineServer(resource) {
        return resource.provides === 'server' && normalizeBoolean(resource.presence);
    }

    /**
     * Transform connection object to normalized format
     * @param {Object} conn - Connection object from Plex API
     * @returns {Object} Normalized connection object
     */
    function normalizeConnection(conn) {
        return {
            uri: conn.uri,
            local: normalizeBoolean(conn.local),
            relay: normalizeBoolean(conn.relay),
            address: conn.address,
            port: conn.port,
            protocol: conn.protocol
        };
    }

    /**
     * Transform server resource to application format
     * @param {Object} server - Server resource from Plex API
     * @returns {Object} Transformed server object
     */
    function transformServer(server) {
        return {
            name: server.name,
            clientIdentifier: server.clientIdentifier,
            connections: server.connections.map(normalizeConnection),
            preferredConnection: selectBestConnection(server.connections)
        };
    }

    /**
     * Get user's Plex servers
     * @returns {Promise<Array>} List of available Plex servers
     */
    async function getUserServers() {
        const token = getStoredToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const clientId = getClientIdentifier();

        try {
            const response = await axios.get(CONFIG.plexResourcesUrl, {
                headers: {
                    'accept': 'application/json',
                    'X-Plex-Token': token,
                    'X-Plex-Client-Identifier': clientId
                }
            });

            const servers = response.data
                .filter(isOnlineServer)
                .map(transformServer);

            return servers;
        } catch (error) {
            console.error('Failed to get user servers:', error.message);
            if (error.response?.data) {
                console.error('API Error:', error.response.data);
            }
            throw new Error('Failed to retrieve Plex servers');
        }
    }

    /**
     * Select the best connection from available connections
     * Priority: Remote HTTPS > Remote HTTP > Local HTTPS > Local HTTP
     * (Prefers external/public addresses for better accessibility)
     * @param {Array} connections - Array of connection objects
     * @returns {Object} Best connection
     */
    function selectBestConnection(connections) {
        if (!connections || connections.length === 0) return null;

        // Sort connections by preference
        const sorted = connections.sort((a, b) => {
            // Remote connections are preferred over local (for external access)
            if (a.local !== b.local) return a.local - b.local;
            // HTTPS is preferred over HTTP
            if (a.protocol !== b.protocol) {
                return a.protocol === 'https' ? -1 : 1;
            }
            return 0;
        });

        return {
            uri: sorted[0].uri,
            local: sorted[0].local === 1,
            protocol: sorted[0].protocol
        };
    }

    /**
     * Store selected server
     * @param {Object} server - Server object with name and connection info
     */
    function storeSelectedServer(server) {
        localStorage.setItem(CONFIG.storageKeys.selectedServer, JSON.stringify(server));
    }

    /**
     * Get stored selected server
     * @returns {Object|null} Server object or null
     */
    function getStoredServer() {
        const serverStr = localStorage.getItem(CONFIG.storageKeys.selectedServer);
        if (!serverStr) return null;

        try {
            return JSON.parse(serverStr);
        } catch (error) {
            console.error('Failed to parse stored server:', error);
            return null;
        }
    }

    /**
     * Clear stored server
     */
    function clearStoredServer() {
        localStorage.removeItem(CONFIG.storageKeys.selectedServer);
    }

    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>} True if authenticated with valid token
     */
    async function isAuthenticated() {
        const token = getStoredToken();
        if (!token) return false;
        
        const userInfo = await validateToken(token);
        if (!userInfo) {
            clearAuth();
            return false;
        }
        
        // Update stored user info if validation succeeded
        storeToken(token, userInfo);
        return true;
    }

    /**
     * Initiate authentication flow using Polling method with auto-redirect
     * Opens Plex link in new tab and starts polling for token
     * @returns {Promise<Object>} User info when authentication completes
     */
    async function initiateAuthWithPolling() {
        try {
            const pin = await generatePin();
            const plexLinkUrl = getPlexLinkUrl(pin.code);
            
            // Open Plex link in new window
            window.open(plexLinkUrl, '_blank');
            
            // Start polling for token
            const token = await pollForToken(pin.id);
            const userInfo = await validateToken(token);
            
            if (!userInfo) {
                throw new Error('Failed to validate authentication token');
            }
            
            storeToken(token, userInfo);
            return userInfo;
        } catch (error) {
            console.error('Failed to complete authentication:', error);
            throw error;
        }
    }

    /**
     * Initiate authentication flow using Polling method
     * @returns {Promise<{pinCode: string, pinId: number}>} PIN information for display
     */
    async function initiateAuthPolling() {
        try {
            const pin = await generatePin();
            return {
                pinCode: pin.code,
                pinId: pin.id
            };
        } catch (error) {
            console.error('Failed to initiate authentication:', error);
            throw error;
        }
    }

    /**
     * Complete authentication after polling
     * @param {number} pinId - PIN ID from initiateAuthPolling
     * @returns {Promise<Object>} User info
     */
    async function completeAuthPolling(pinId) {
        try {
            const token = await pollForToken(pinId);
            const userInfo = await validateToken(token);
            
            if (!userInfo) {
                throw new Error('Failed to validate authentication token');
            }
            
            storeToken(token, userInfo);
            return userInfo;
        } catch (error) {
            console.error('Failed to complete authentication:', error);
            throw error;
        }
    }

    /**
     * Handle OAuth callback (for Forwarding method)
     * Extracts token from URL fragment and validates it
     * @returns {Promise<Object|null>} User info if successful, null otherwise
     */
    async function handleAuthCallback() {
        // Check for auth token in URL fragment
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        
        // Look for authToken parameter (Plex may use different parameter names)
        const token = params.get('authToken') || params.get('token') || params.get('X-Plex-Token');
        
        if (!token) {
            return null;
        }
        
        // Validate token
        const userInfo = await validateToken(token);
        if (!userInfo) {
            throw new Error('Received invalid authentication token');
        }
        
        // Store token and user info
        storeToken(token, userInfo);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        
        return userInfo;
    }

    /**
     * Get authentication headers for API requests
     * @returns {Object} Headers object with X-Plex-Token
     */
    function getAuthHeaders() {
        const token = getStoredToken();
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        return {
            'X-Plex-Token': token
        };
    }

    /**
     * Configure axios to automatically include auth token
     */
    function configureAxios() {
        // Add request interceptor to include token
        axios.interceptors.request.use(
            function(config) {
                const token = getStoredToken();
                if (token && config.url && config.url.includes('plex')) {
                    config.headers['X-Plex-Token'] = token;
                }
                return config;
            },
            function(error) {
                return Promise.reject(error);
            }
        );

        // Add response interceptor to handle 401 errors
        axios.interceptors.response.use(
            function(response) {
                return response;
            },
            function(error) {
                if (error.response && error.response.status === 401) {
                    console.warn('Authentication failed, clearing stored credentials');
                    clearAuth();
                    // Optionally trigger re-authentication
                    window.dispatchEvent(new CustomEvent('plex-auth-required'));
                }
                return Promise.reject(error);
            }
        );
    }

    // Public API
    return {
        // Configuration
        config: CONFIG,
        
        // Authentication methods
        initiateAuthWithPolling,
        initiateAuthPolling,
        completeAuthPolling,
        handleAuthCallback,
        
        // Token management
        getStoredToken,
        getStoredUserInfo,
        validateToken,
        clearAuth,
        isAuthenticated,
        
        // Server discovery
        getUserServers,
        storeSelectedServer,
        getStoredServer,
        clearStoredServer,
        
        // Utilities
        getClientIdentifier,
        getAuthHeaders,
        configureAxios,
        
        // For advanced usage
        generatePin,
        getPlexLinkUrl,
        checkPinStatus,
        pollForToken
    };
})();

// Auto-configure axios when module loads
if (typeof axios !== 'undefined') {
    PlexAuth.configureAxios();
}

// Made with Bob
