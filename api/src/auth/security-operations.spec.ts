import { PlatformSecurityOperationsController } from '../super-admin/controllers/platform-security-operations.controller';

describe('P6 Platform Security Operations Controller Suite', () => {
  let controller: PlatformSecurityOperationsController;
  let mockSecOpsService: any;

  beforeEach(() => {
    mockSecOpsService = {
      getSecurityHealth: jest.fn().mockResolvedValue({
        overallStatus: 'HEALTHY',
        lastCheckedAt: new Date().toISOString(),
      }),
      getSecurityMetrics: jest.fn().mockResolvedValue({
        period: '24h',
        metrics: { loginSuccessCount: 150, loginFailureCount: 2 },
        anomaliesDetected: [],
      }),
      getSecurityTimeline: jest.fn().mockResolvedValue([
        { id: 'log-1', action: 'LOGIN_SUCCESS', createdAt: new Date() },
      ]),
      getSecurityConfig: jest.fn().mockReturnValue({
        thresholds: { loginFailureThreshold: 50 },
      }),
    };

    controller = new PlatformSecurityOperationsController(mockSecOpsService as any);
  });

  describe('1. Controller Endpoints', () => {
    it('returns live health data via GET /health', async () => {
      const res = await controller.getHealth();
      expect(res.success).toBe(true);
      expect(res.data.overallStatus).toBe('HEALTHY');
      expect(mockSecOpsService.getSecurityHealth).toHaveBeenCalled();
    });

    it('returns telemetry metrics via GET /metrics', async () => {
      const res = await controller.getMetrics('7d');
      expect(res.success).toBe(true);
      expect(mockSecOpsService.getSecurityMetrics).toHaveBeenCalledWith('7d');
    });

    it('returns event timeline via GET /timeline', async () => {
      const res = await controller.getTimeline('10');
      expect(res.success).toBe(true);
      expect(mockSecOpsService.getSecurityTimeline).toHaveBeenCalledWith(10);
    });

    it('returns read-only security config via GET /config', () => {
      const res = controller.getConfig();
      expect(res.success).toBe(true);
      expect(res.data.thresholds).toBeDefined();
    });
  });
});
