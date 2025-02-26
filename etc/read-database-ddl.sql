-- anselmo_telemetria.cidade definition

CREATE TABLE `cidade` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `uf_sigla` char(2) NOT NULL DEFAULT 'RJ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idu_nome_cidade` (`nome`,`uf_sigla`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.crud_log definition

CREATE TABLE `crud_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `ip` varchar(30) CHARACTER SET latin1 NOT NULL,
  `controller` varchar(100) CHARACTER SET latin1 NOT NULL,
  `datahora` datetime NOT NULL,
  `operacao` varchar(50) CHARACTER SET latin1 NOT NULL,
  `dados` longtext CHARACTER SET latin1 DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `fk_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.grupo definition

CREATE TABLE `grupo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_UNIQUE` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.leitura_calculada definition

CREATE TABLE `leitura_calculada` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `datahora` datetime NOT NULL,
  `estacao_id` bigint(20) NOT NULL,
  `temperatura` double DEFAULT NULL,
  `umidade_ar` double DEFAULT NULL,
  `velocidade_vento` double DEFAULT NULL,
  `dir_vento` varchar(5) CHARACTER SET utf8mb3 DEFAULT NULL,
  `volume_chuva` double DEFAULT NULL,
  `payload` text CHARACTER SET utf8mb3 DEFAULT NULL,
  `datahora_cadastro` datetime DEFAULT NULL,
  `volume_chuva_ac_1h` double DEFAULT NULL,
  `volume_chuva_ac_24h` double DEFAULT NULL,
  `volume_chuva_ac_96h` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- anselmo_telemetria.parametros definition

CREATE TABLE `parametros` (
  `nome` varchar(50) NOT NULL,
  `titulo` varchar(50) NOT NULL,
  `descricao` text DEFAULT NULL,
  `valor` text DEFAULT NULL,
  PRIMARY KEY (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.tipo_evento definition

CREATE TABLE `tipo_evento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.tipo_evento_externo definition

CREATE TABLE `tipo_evento_externo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.tipo_ocorrencia definition

CREATE TABLE `tipo_ocorrencia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `ordem` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_UNIQUE` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.unidade_medida definition

CREATE TABLE `unidade_medida` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidade` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `formato` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `descricao_UNIQUE` (`descricao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- anselmo_telemetria.usuario definition

CREATE TABLE `usuario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `senha` varchar(200) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `obs` text DEFAULT NULL,
  `ativo` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.usuario_externo definition

CREATE TABLE `usuario_externo` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf_UNIQUE` (`cpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.bairro definition

CREATE TABLE `bairro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cidade_id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_UNIQUE` (`nome`),
  KEY `fk_bairro_cidade1_idx` (`cidade_id`),
  CONSTRAINT `fk_bairro_cidade1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.endereco definition

CREATE TABLE `endereco` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(100) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero` varchar(45) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `bairro_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_endereco_bairro1_idx` (`bairro_id`),
  CONSTRAINT `fk_endereco_bairro1` FOREIGN KEY (`bairro_id`) REFERENCES `bairro` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.estacao definition

CREATE TABLE `estacao` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `endereco_id` bigint(20) DEFAULT NULL,
  `endereco` varchar(300) DEFAULT NULL,
  `identificador` varchar(100) NOT NULL,
  `descricao` varchar(100) DEFAULT NULL,
  `foto_estacao` varchar(255) DEFAULT NULL,
  `tipo` enum('interna','weather.com') NOT NULL DEFAULT 'interna',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `ativa` tinyint(4) NOT NULL DEFAULT 1,
  `obs` text DEFAULT NULL,
  `weathercloud_api_id` varchar(255) DEFAULT NULL,
  `weathercloud_api_key` varchar(255) DEFAULT NULL,
  `weathercom_station_id` varchar(50) DEFAULT NULL,
  `weathercom_api_key` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_UNIQUE` (`identificador`),
  KEY `fk_estacao_endereco1_idx` (`endereco_id`),
  CONSTRAINT `fk_estacao_endereco1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.evento definition

CREATE TABLE `evento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `estacao_id` bigint(20) NOT NULL,
  `datahora` datetime NOT NULL,
  `tipo_evento_id` int(11) NOT NULL,
  `notificado_email` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_evento_estacao1_idx` (`estacao_id`),
  KEY `fk_evento_tipo_evento1_idx` (`tipo_evento_id`),
  KEY `datahora` (`datahora`),
  CONSTRAINT `fk_evento_estacao1` FOREIGN KEY (`estacao_id`) REFERENCES `estacao` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_evento_tipo_evento1` FOREIGN KEY (`tipo_evento_id`) REFERENCES `tipo_evento` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=23406 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.evento_externo definition

CREATE TABLE `evento_externo` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_externo_id` bigint(20) NOT NULL,
  `tipo_evento_externo_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_evento_externo_usuario_externo1_idx` (`usuario_externo_id`),
  KEY `fk_evento_externo_tipo_evento_externo1_idx` (`tipo_evento_externo_id`),
  CONSTRAINT `fk_evento_externo_tipo_evento_externo1` FOREIGN KEY (`tipo_evento_externo_id`) REFERENCES `tipo_evento_externo` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_evento_externo_usuario_externo1` FOREIGN KEY (`usuario_externo_id`) REFERENCES `usuario_externo` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.grupo_acessa_endereco definition

CREATE TABLE `grupo_acessa_endereco` (
  `grupo_id` int(11) NOT NULL,
  `endereco_id` bigint(20) NOT NULL,
  `ordem` int(11) NOT NULL,
  PRIMARY KEY (`grupo_id`,`endereco_id`),
  KEY `fk_grupo_has_endereco_endereco1_idx` (`endereco_id`),
  KEY `fk_grupo_has_endereco_grupo1_idx` (`grupo_id`),
  CONSTRAINT `fk_grupo_has_endereco_endereco1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_grupo_has_endereco_grupo1` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.grupo_acessa_estacao definition

CREATE TABLE `grupo_acessa_estacao` (
  `grupo_id` int(11) NOT NULL,
  `estacao_id` bigint(20) NOT NULL,
  `ordem` int(11) NOT NULL,
  PRIMARY KEY (`grupo_id`,`estacao_id`),
  KEY `fk_grupo_has_estacao_estacao1_idx` (`estacao_id`),
  KEY `fk_grupo_has_estacao_grupo1_idx` (`grupo_id`),
  CONSTRAINT `fk_grupo_has_estacao_estacao1` FOREIGN KEY (`estacao_id`) REFERENCES `estacao` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_grupo_has_estacao_grupo1` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.grupo_possui_permissao definition

CREATE TABLE `grupo_possui_permissao` (
  `grupo_usuarios_id` int(11) NOT NULL,
  `permissao` varchar(100) NOT NULL,
  PRIMARY KEY (`permissao`,`grupo_usuarios_id`),
  KEY `fk_grupo_usuarios_permissao_grupo_usuarios1_idx` (`grupo_usuarios_id`),
  CONSTRAINT `fk_grupo_usuarios_permissao_grupo_usuarios1` FOREIGN KEY (`grupo_usuarios_id`) REFERENCES `grupo` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.leitura definition

CREATE TABLE `leitura` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `datahora` datetime NOT NULL,
  `estacao_id` bigint(20) NOT NULL,
  `temperatura` double DEFAULT NULL,
  `umidade_ar` double DEFAULT NULL,
  `velocidade_vento` double DEFAULT NULL,
  `dir_vento` varchar(5) DEFAULT NULL,
  `volume_chuva` double DEFAULT NULL,
  `volume_acc_chuva` double DEFAULT NULL,
  `pressao_atm` double DEFAULT NULL,
  `payload` text DEFAULT NULL,
  `datahora_cadastro` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_leitura_estacao1_idx` (`estacao_id`),
  KEY `datahora` (`datahora`),
  CONSTRAINT `fk_leitura_estacao1` FOREIGN KEY (`estacao_id`) REFERENCES `estacao` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2194674 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.leitura_dimensao definition

CREATE TABLE `leitura_dimensao` (
  `tag` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidade_medida_id` int(11) NOT NULL,
  PRIMARY KEY (`tag`),
  UNIQUE KEY `nome_UNIQUE` (`nome`),
  KEY `fk_leitura_dimensao_unidade1_idx` (`unidade_medida_id`),
  CONSTRAINT `fk_leitura_dimensao_unidade1` FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidade_medida` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- anselmo_telemetria.leitura_parametro_discreto definition

CREATE TABLE `leitura_parametro_discreto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `leitura_dimensao_tag` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('variacao','variacao_percent','janela_tempo') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valor` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_leitura_parametro_discreto_leitura_dimensao1_idx` (`leitura_dimensao_tag`),
  CONSTRAINT `fk_leitura_parametro_discreto_leitura_dimensao1` FOREIGN KEY (`leitura_dimensao_tag`) REFERENCES `leitura_dimensao` (`tag`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- anselmo_telemetria.leitura_valor definition

CREATE TABLE `leitura_valor` (
  `leitura_dimensao_tag` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leitura_id` bigint(20) NOT NULL,
  `valor` float DEFAULT NULL,
  `valor_texto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`leitura_dimensao_tag`,`leitura_id`),
  KEY `fk_leitura_dimensao_has_leitura_leitura1_idx` (`leitura_id`),
  CONSTRAINT `fk_leitura_dimensao_has_leitura_leitura1` FOREIGN KEY (`leitura_id`) REFERENCES `leitura` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- anselmo_telemetria.ocorrencia definition

CREATE TABLE `ocorrencia` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tipo_ocorrencia_id` int(11) NOT NULL,
  `datahora_ocorrido` datetime NOT NULL,
  `endereco` varchar(300) NOT NULL,
  `descricao` text NOT NULL,
  `usuario_id` bigint(20) DEFAULT NULL,
  `datahora_cadastro` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ocorrencia_tipo_ocorrencia1_idx` (`tipo_ocorrencia_id`),
  KEY `fk_ocorrencia_usuario1_idx` (`usuario_id`),
  CONSTRAINT `fk_ocorrencia_tipo_ocorrencia1` FOREIGN KEY (`tipo_ocorrencia_id`) REFERENCES `tipo_ocorrencia` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_ocorrencia_usuario1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.troca_de_senha definition

CREATE TABLE `troca_de_senha` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `token` varchar(100) NOT NULL,
  `criado` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expirado` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `troca_de_senha_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.ultima_leitura_valor definition

CREATE TABLE `ultima_leitura_valor` (
  `leitura_dimensao_tag` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leitura_id` bigint(20) NOT NULL,
  `valor` float DEFAULT NULL,
  `valor_texto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estacao_id` bigint(20) NOT NULL,
  PRIMARY KEY (`leitura_dimensao_tag`,`leitura_id`),
  KEY `fk_leitura_dimensao_has_leitura_leitura1_idx` (`leitura_id`),
  KEY `fk_ultima_leitura_valor_estacao1_idx` (`estacao_id`),
  CONSTRAINT `fk_leitura_dimensao_has_leitura_leitura10` FOREIGN KEY (`leitura_id`) REFERENCES `leitura` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_ultima_leitura_valor_estacao1` FOREIGN KEY (`estacao_id`) REFERENCES `estacao` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- anselmo_telemetria.usuario_acessa_estacao definition

CREATE TABLE `usuario_acessa_estacao` (
  `usuario_id` bigint(20) NOT NULL,
  `estacao_id` bigint(20) NOT NULL,
  `ordem` int(11) DEFAULT NULL,
  PRIMARY KEY (`usuario_id`,`estacao_id`),
  KEY `fk_usuario_has_estacao_estacao1_idx` (`estacao_id`),
  KEY `fk_usuario_has_estacao_usuario1_idx` (`usuario_id`),
  CONSTRAINT `fk_usuario_has_estacao_estacao1` FOREIGN KEY (`estacao_id`) REFERENCES `estacao` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuario_has_estacao_usuario1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


-- anselmo_telemetria.usuario_possui_grupo definition

CREATE TABLE `usuario_possui_grupo` (
  `usuario_id` bigint(20) NOT NULL,
  `grupo_usuarios_id` int(11) NOT NULL,
  PRIMARY KEY (`usuario_id`,`grupo_usuarios_id`),
  KEY `fk_usuario_has_grupo_usuarios_grupo_usuarios1_idx` (`grupo_usuarios_id`),
  KEY `fk_usuario_has_grupo_usuarios_usuario_idx` (`usuario_id`),
  CONSTRAINT `fk_usuario_has_grupo_usuarios_grupo_usuarios1` FOREIGN KEY (`grupo_usuarios_id`) REFERENCES `grupo` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuario_has_grupo_usuarios_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;