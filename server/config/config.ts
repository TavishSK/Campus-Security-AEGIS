/**
 * System and Operational Configuration
 */

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'aegis-tactical-secret-key-0x9f38a7c1c4',
  SIMULATION_ENABLED: true,
  SIMULATION_INTERVAL_MS: 3800, // push new synthetic signal every ~3.8 seconds
  RISK_THRESHOLDS: {
    NORMAL: 24,
    LOW: 49,
    MODERATE: 69,
    HIGH: 89,
    CRITICAL: 100,
  },
  MODEL: {
    PROVIDER: 'Google Gemini & Deterministic Neural Classifier',
    NAME: 'gemini-3.8-flash',
    FALLBACK_VERSION: 'AEGIS_AST_TOKENIZER_v4.18',
  },
  SYSTEM: {
    BUILD_HASH: '0x9f38a7c1c4',
    VERSION: 'v4.18.2 [BLACK-HAT PROXY]',
    DEFCON_LEVEL: 2,
    DEFAULT_OPERATOR: {
      id: 'OP-07',
      callsign: 'BLACK_HAT_07',
      clearance: 'ROOT // 0x00FF',
      role: 'ADMIN',
      token: 'jwt_root_aegis_token_0x992',
    },
  },
};
