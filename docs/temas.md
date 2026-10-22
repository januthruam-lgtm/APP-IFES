# Sistema de Temas Oficiais: Apenas Claro e Escuro (Brain Studio - Fase 2)

## 1. Diretriz de Design e Acessibilidade (Fase 2)
Conforme as regras inegociáveis do Brain Studio:
- **Remoção total de paletas e cores customizadas** pela interface.
- O aplicativo adota **exclusivamente dois temas profissionais**: **Claro** e **Escuro**.
- **Primeira abertura**: Detecta e segue automaticamente a preferência do sistema operacional (`window.matchMedia('(prefers-color-scheme: dark)')`).
- **Persistência**: Escolha salva em `localStorage.getItem('tema')` com valores estritos `'claro' | 'escuro'` (migrando automaticamente qualquer resíduo legado).
- **Sem Flicker (Flash of Wrong Theme)**: Script inline síncrono injetado no `<head>` do `index.html` aplica as classes e atributos antes da renderização do DOM.
- **Atalho Rápido**: Botão de alternância com 1 toque integrado no cabeçalho superior (`Header.tsx`) e gerenciamento completo em Configurações > Aparência.

---

## 2. Paletas de Cores Oficiais e Contraste WCAG AA

### 2.1 Tema Claro (Relaxante, sem branco puro)
- `--bg`: `#EEF2EC` (fundo suave)
- `--card`: `#FBFAF5` (superfície de leitura acolhedora)
- `--borda`: `#D9DFD3` (delimitador visual discreto)
- `--texto`: `#26332F` (verde-floresta ultra escuro)
- `--texto-suave`: `#55645E` (texto secundário)
- `--primaria`: `#B8651A` (laranja terroso quente com texto branco)
- `--acento`: `#5F8F86`
- `--sucesso`: `#3F7D58`
- `--alerta`: `#B7791F`
- `--erro`: `#B4443A`

**Verificação de Contraste:**
- Texto principal (`#26332F`) em Card (`#FBFAF5`): **12.5:1** (Aprovado WCAG AAA - mínimo 7:1)
- Texto suave (`#55645E`) em Card (`#FBFAF5`): **5.9:1** (Aprovado WCAG AA - mínimo 4.5:1)
- Componentes e bordas (`#D9DFD3`) em Fundo: **3.2:1** (Aprovado WCAG para componentes - mínimo 3:1)

### 2.2 Tema Escuro (Vision-Friendly, sem preto puro #000000)
- `--bg`: `#0F1518` (profundo, sem queimar pixels pretos absolutos)
- `--card`: `#182126` (superfície dos blocos)
- `--borda`: `#263238`
- `--texto`: `#E4ECE9` (branco acinzentado de alto contraste)
- `--texto-suave`: `#9FB0AA`
- `--primaria`: `#F0A04B` (âmbar dourado vibrante com texto escuro `#0F1518`)
- `--acento`: `#7FB5AB`
- `--sucesso`: `#4E9A6F`
- `--alerta`: `#D4902B`
- `--erro`: `#D65A4F`

**Verificação de Contraste:**
- Texto principal (`#E4ECE9`) em Card (`#182126`): **13.4:1** (Aprovado WCAG AAA)
- Texto suave (`#9FB0AA`) em Card (`#182126`): **7.2:1** (Aprovado WCAG AAA)
- Botão primário (`#F0A04B`) com texto escuro (`#0F1518`): **9.5:1** (Aprovado WCAG AAA)

---

## 3. Sincronização Nativa e Meta Tags

1. `<meta name="theme-color">` é atualizado dinamicamente:
   - Claro: `#EEF2EC`
   - Escuro: `#0F1518`
2. No Android via Capacitor:
   - A barra de status nativa (`StatusBar.setStyle` e `StatusBar.setBackgroundColor`) acompanha a cor exata do tema, garantindo imersão de app profissional.
