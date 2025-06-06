-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 06/06/2025 às 16:45
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `estoque`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionarios`
--

CREATE TABLE `funcionarios` (
  `id` int(11) NOT NULL,
  `FotoPerfil` varchar(255) DEFAULT NULL,
  `Nome` varchar(255) NOT NULL,
  `NomeCompleto` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `Telefone` int(11) NOT NULL,
  `Cargo` varchar(255) NOT NULL,
  `Departamento` varchar(255) NOT NULL,
  `DataAdmissao` varchar(255) NOT NULL,
  `created_at` varchar(255) NOT NULL,
  `updated_at` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `funcionarios`
--

INSERT INTO `funcionarios` (`id`, `FotoPerfil`, `Nome`, `NomeCompleto`, `senha`, `email`, `Telefone`, `Cargo`, `Departamento`, `DataAdmissao`, `created_at`, `updated_at`) VALUES
(1, '', 'joao', 'João da Silva Santos', 'senha', 'joaoaugebit@gmail.com', 2147483647, 'Estoquista', 'Departamento de Suprimentos', '', '', ''),
(2, '', 'Ana dos Santos', 'Ana Nonato dos Santos', '123456', 'anaaugebit@gmail.com', 0, 'Estoquista', 'Departamento de Suprimentos', '', '', ''),
(3, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', 'Nicole Ayla', 'Nicole Ayla Inoue Kiyan', '123456', 'nicoleaugebit@gmail.com', 11, 'Gerente', 'Departamento de Suprimentos', '01/05/2025', '', '2025-06-06 08:32:34'),
(4, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', 'Amanda Sales ', 'Amanda Sales ', '123', 'amandaaugebit@gmail.com', 0, 'Analista de Dados', 'Departamento de Suprimentos', '', '', '2025-05-30 10:20:21');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto`
--

CREATE TABLE `produto` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `quantidade` int(11) DEFAULT 0,
  `minimo` int(11) DEFAULT 5,
  `fornecedor` varchar(255) DEFAULT NULL,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `produto`
--

INSERT INTO `produto` (`id`, `nome`, `descricao`, `categoria`, `preco`, `quantidade`, `minimo`, `fornecedor`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Notebook Dell Inspiron 15', 'Notebook Dell Inspiron 15', 'Eletrônicos', 155.00, 5, 6, 'Dell Brasil', 'ativo', '2025-06-05 17:15:22', '2025-06-05 17:15:22'),
(2, 'Mouse', 'mouse branco', 'Periféricos', 69.90, 1, 10, 'Dell Brasil', 'ativo', '2025-06-05 17:34:43', '2025-06-06 12:07:01');

-- --------------------------------------------------------

--
-- Estrutura para tabela `requisicoes`
--

CREATE TABLE `requisicoes` (
  `id` int(11) NOT NULL,
  `mes` varchar(20) DEFAULT NULL,
  `total_requisicoes` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `requisicoes`
--

INSERT INTO `requisicoes` (`id`, `mes`, `total_requisicoes`) VALUES
(1, 'Janeiro', 1),
(2, 'Fevereiro', 6),
(3, 'Março', 10),
(4, 'Abril', 10),
(5, 'Maio', 12);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `requisicoes`
--
ALTER TABLE `requisicoes`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `requisicoes`
--
ALTER TABLE `requisicoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
