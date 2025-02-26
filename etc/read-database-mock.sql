DELETE FROM leitura;
DELETE FROM estacao;
DELETE FROM `endereco`;
DELETE FROM `bairro`;
DELETE FROM `cidade`;


-- Insert data for the 'cidade' table with explicit IDs
INSERT INTO `cidade` (`id`, `nome`, `uf_sigla`) VALUES
(1, 'Rio de Janeiro', 'RJ'),
(2, 'São Paulo', 'SP');

-- Insert data for the 'bairro' table
INSERT INTO `bairro` (`id`, `cidade_id`, `nome`) VALUES
(1, 1, 'Copacabana'),
(2, 1, 'Ipanema'),
(3, 1, 'Lapa'),
(4, 2, 'Jardim Paulista'),
(5, 2, 'Vila Mariana');


-- Insert data for the 'endereco' table with explicit IDs
INSERT INTO `endereco` (
  `id`,
  `descricao`, 
  `logradouro`, 
  `numero`, 
  `complemento`, 
  `cep`, 
  `bairro_id`
) VALUES 
(1, 'Endereço da Estação 1', 'Rua das Flores', '123', 'Apto 101', '12345-678', 1),
(2, 'Endereço da Estação 2', 'Avenida Paulista', '456', 'Sala 203', '98765-432', 2),
(3, 'Endereço da Estação 3', 'Praça da Sé', '789', 'Bloco B', '10101-010', 3),
(4, 'Endereço da Estação 4', 'Rua dos Três Irmãos', '1010', NULL, '20202-202', 4),
(5, 'Endereço da Estação 5', 'Avenida Rio Branco', '1500', 'Andar 4', '30303-303', 5);

-- Insert data for the 'estacao' table
INSERT INTO `estacao` (
  `id`,
  `endereco_id`, 
  `endereco`, 
  `identificador`, 
  `descricao`, 
  `foto_estacao`, 
  `tipo`, 
  `latitude`, 
  `longitude`, 
  `ativa`, 
  `obs`, 
  `weathercloud_api_id`, 
  `weathercloud_api_key`, 
  `weathercom_station_id`, 
  `weathercom_api_key`
) VALUES 
(1, 1, 'Rua das Flores, 123, São Paulo, SP', 'EST001', 'Estação de Monitoramento Meteorológico 01', 'estacao01.jpg', 'interna', -23.550520, -46.633308, 1, 'Estação interna de monitoramento', 'weathercloud_id_1', 'weathercloud_key_1', 'weathercom_station_id_1', 'weathercom_key_1'),
(2, 2, 'Avenida Paulista, 456, São Paulo, SP', 'EST002', 'Estação de Monitoramento Meteorológico 02', 'estacao02.jpg', 'weather.com', -23.564595, -46.651264, 1, 'Estação externa de monitoramento meteorológico via weather.com', 'weathercloud_id_2', 'weathercloud_key_2', 'weathercom_station_id_2', 'weathercom_key_2'),
(3, 3, 'Praça da Sé, 789, São Paulo, SP', 'EST003', 'Estação de Monitoramento Meteorológico 03', 'estacao03.jpg', 'interna', -23.550850, -46.633880, 1, 'Estação interna com sensores de clima para a praça da Sé', 'weathercloud_id_3', 'weathercloud_key_3', 'weathercom_station_id_3', 'weathercom_key_3'),
(4, 4, 'Rua dos Três Irmãos, 1010, São Paulo, SP', 'EST004', 'Estação de Monitoramento Meteorológico 04', 'estacao04.jpg', 'weather.com', -23.584190, -46.649462, 0, 'Estação externa inativa para manutenção', 'weathercloud_id_4', 'weathercloud_key_4', 'weathercom_station_id_4', 'weathercom_key_4'),
(5, 5, 'Avenida Rio Branco, 1500, São Paulo, SP', 'EST005', 'Estação de Monitoramento Meteorológico 05', 'estacao05.jpg', 'interna', -23.589432, -46.637912, 1, 'Estação interna de monitoramento de clima geral', 'weathercloud_id_5', 'weathercloud_key_5', 'weathercom_station_id_5', 'weathercom_key_5');



INSERT INTO `leitura` (
  `datahora`, 
  `estacao_id`, 
  `temperatura`, 
  `umidade_ar`, 
  `velocidade_vento`, 
  `dir_vento`, 
  `volume_chuva`, 
  `volume_acc_chuva`, 
  `pressao_atm`, 
  `payload`, 
  `datahora_cadastro`
) VALUES 
('2025-02-26 08:00:00', 1, 25.6, 85.2, 5.3, 'N', 12.5, 50.0, 1013.2, 'Sample data for testing', '2025-02-26 08:05:00'),
('2025-02-26 08:15:00', 2, 24.8, 83.1, 6.1, 'NE', 8.2, 40.0, 1012.8, 'Test payload 2', '2025-02-26 08:20:00'),
('2025-02-26 08:30:00', 1, 23.5, 80.0, 7.0, 'E', 10.1, 45.0, 1014.0, 'Test payload 3', '2025-02-26 08:35:00'),
('2025-02-26 08:45:00', 3, 22.0, 78.5, 3.2, 'S', 15.3, 60.0, 1011.5, 'Test payload 4', '2025-02-26 08:50:00'),
('2025-02-26 09:00:00', 2, 21.7, 76.8, 4.0, 'SW', 5.0, 30.0, 1010.9, 'Test payload 5', '2025-02-26 09:05:00');
