import { Router } from 'express';
import { db } from '../db/store.js';
import { CONFIG } from '../config/config.js';

export const authRouter = Router();

authRouter.get('/me', (_req, res) => {
  res.json({
    success: true,
    data: {
      operator: CONFIG.SYSTEM.DEFAULT_OPERATOR,
      sessionValid: true,
      permissions: ['DEFCON_CONTROL', 'AIRGAP_TRIGGER', 'CLASSIFY_PAYLOAD', 'AUDIT_SIGN'],
    },
  });
});

authRouter.post('/login', (req, res) => {
  const { callsign } = req.body;
  res.json({
    success: true,
    data: {
      operator: {
        ...CONFIG.SYSTEM.DEFAULT_OPERATOR,
        callsign: callsign || CONFIG.SYSTEM.DEFAULT_OPERATOR.callsign,
      },
      token: 'jwt_aegis_valid_auth_token_0x7f',
    },
  });
});

authRouter.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Operator logged out' });
});
