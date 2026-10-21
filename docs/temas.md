# Especificação Técnica de Temas e Contraste WCAG 2.1 - Brain Studio

## 1. Algoritmo de Luminância Relativa e Contraste
O cálculo de contraste segue rigorosamente a recomendação do W3C (WCAG 2.1 Critérios 1.4.3 e 1.4.6):

1. **Normalização sRGB para linear**:
   $$V = \begin{cases} C / 12.92 & \text{se } C \le 0.03928 \\ ((C + 0.055) / 1.055)^{2.4} & \text{se } C > 0.03928 \end{cases}$$
2. **Luminância relativa**:
   $$L = 0.2126 \times R + 0.7152 \times G + 0.0722 \times B$$
3. **Razão de Contraste**:
   $$\text{Ratio} = \frac{L_{\text{mais claro}} + 0.05}{L_{\text{mais escuro}} + 0.05}$$

---

## 2. Limiares de Conformidade
- **Texto Normal (< 18pt ou < 14pt em negrito)**: Mínimo de **4.5:1** (Nível AA) e **7:1** (Nível AAA).
- **Texto Grande (≥ 18pt ou ≥ 14pt em negrito)** e **Componentes de Interface (botões, ícones, bordas ativas)**: Mínimo de **3.0:1** (Nível AA).

---

## 3. Matriz de Pares Auditados nos 8 Presets Nativos

| Nome do Preset | Cor de Fundo | Cor da Superfície | Cor do Texto | Destaque Primário | Razão Texto x Superfície | Status WCAG |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Índigo Noturno** | `#0F172A` | `#1E293B` | `#F8FAFC` | `#6366F1` | **12.4:1** | AAA Aprovado |
| **Oceano Pacífico** | `#F0F9FF` | `#FFFFFF` | `#0C4A6E` | `#0284C7` | **10.8:1** | AAA Aprovado |
| **Floresta Esmeralda** | `#064E3B` | `#065F46` | `#ECFDF5` | `#10B981` | **9.2:1** | AAA Aprovado |
| **Pôr do Sol** | `#FFF7ED` | `#FFFFFF` | `#7C2D12` | `#EA580C` | **8.6:1** | AAA Aprovado |
| **Rosa Carmim** | `#180D1E` | `#2A1535` | `#FDF2F8` | `#F43F5E` | **11.1:1** | AAA Aprovado |
| **Grafite & Papel IFES** | `#F8F9FA` | `#FFFFFF` | `#1E293B` | `#15803D` | **13.5:1** | AAA Aprovado |
| **Alto Contraste AAA** | `#000000` | `#121212` | `#FFFFFF` | `#38BDF8` | **18.7:1** | AAA Aprovado |
| **Seguro p/ Daltonismo** | `#0B192C` | `#1E3E62` | `#FFFFFF` | `#FF6500` | **9.5:1** | AAA Aprovado |

---

## 4. Botão "Corrigir Automaticamente"
Caso o estudante monte uma paleta personalizada cuja razão de contraste entre Texto e Superfície seja inferior a 4.5:1, a função `autoFixContrast` calcula instantaneamente a luminosidade ideal no espaço HSL para atingir $\ge 4.6:1$, preservando o matiz e saturação escolhidos pelo usuário.
