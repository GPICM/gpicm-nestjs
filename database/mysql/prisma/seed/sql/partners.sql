-- Seed for partners
INSERT INTO `partners` (`name`, `email`, `created_at`, `updated_at`) VALUES
('CEMADEN — Centro Nacional de Monitoramento e Alertas', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed for partner_api_keys
INSERT INTO `partner_api_keys` (`key`, `partner_id`, `created_at`, `updated_at`) VALUES
('w06XuxPCwGjrz8Gi2a7yOXmARGY3nH5XhMylTqshRRo4BSGHE2dVsUDZGrloRZZo', 
 (SELECT `id` FROM `partners` WHERE `name` = 'CEMADEN — Centro Nacional de Monitoramento e Alertas' LIMIT 1),
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
