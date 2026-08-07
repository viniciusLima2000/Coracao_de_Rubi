// Links da sua Planilha do Google
const URL_MISSOES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1467808186&single=true&output=csv";
const URL_NPCS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1594591693&single=true&output=csv";
const URL_LOJAS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=795858506&single=true&output=csv";
const URL_COFRE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1380957419&single=true&output=csv";
const URL_DIARIO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1401896465&single=true&output=csv";
const URL_CALENDARIO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1883712087&single=true&output=csv";

function buscarDados(url, callback) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
            // Filtra linhas vazias
            const dadosLimpos = results.data.filter(row => Object.values(row).some(val => val !== ""));
            callback(dadosLimpos);
        }
    });
}

// 1. DIÁRIO
buscarDados(URL_DIARIO, (dados) => {
    let html = "";
    dados.reverse().forEach(d => {
        html += `
        <div class="diario-post">
            <h4 class="diario-titulo">${d.Sessao}</h4>
            <p class="diario-meta">Data Arton: ${d.DataArton} | Registro: ${d.Autor}</p>
            <div class="diario-texto"><p>${d.Resumo ? d.Resumo.replace(/\n/g, '<br>') : ''}</p></div>
        </div>`;
    });
    document.getElementById("conteudo-diario").innerHTML = html || "<p>Nenhum registro encontrado.</p>";
});

// 2. CALENDÁRIO
buscarDados(URL_CALENDARIO, (dados) => {
    let html = "";
    dados.forEach(d => {
        html += `<tr><td>${d.Mes}</td><td>${d.Dia}</td><td>${d.Evento}</td><td>${d.Feriado}</td></tr>`;
    });
    document.getElementById("tabela-calendario").innerHTML = html;
});

// 3. MISSÕES
buscarDados(URL_MISSOES, (dados) => {
    let html = "";
    dados.forEach(d => {
        let statusColor = d.Status === "Concluída" ? "color: #00ffaa;" : (d.Status === "Em Andamento" ? "color: #ffaa00;" : "color: #fff;");
        html += `<tr><td>${d.Titulo}</td><td>${d.Solicitante}</td><td>${d.Local}</td><td>${d.Perigo}</td><td>${d.Recompensa}</td><td style="font-weight: bold; ${statusColor}">${d.Status}</td></tr>`;
    });
    document.getElementById("tabela-missoes").innerHTML = html;
});

// 4. NPCs
buscarDados(URL_NPCS, (dados) => {
    let html = "";
    dados.forEach(d => {
        let imagemUrl = d.Imagem ? d.Imagem : "https://via.placeholder.com/150x200/1a1a24/ff003c?text=SEM+SINAL";
        let corRelacao = d.Relacao && d.Relacao.toLowerCase() === "inimigo" ? "background: rgba(255,0,0,0.2); color: #ff4d4d; border: 1px solid #ff4d4d;" : 
                         (d.Relacao && d.Relacao.toLowerCase() === "aliado" ? "background: rgba(0,255,170,0.2); color: #00ffaa; border: 1px solid #00ffaa;" : 
                         "background: rgba(255,255,255,0.1); color: #ccc; border: 1px solid #ccc;");
        
        html += `
        <div class="npc-card">
            <div class="npc-foto" style="background-image: url('${imagemUrl}');"></div>
            <div class="npc-info">
                <h4>${d.Nome}</h4>
                <p><strong>Classe/Ocupação:</strong> ${d.Ocupacao}</p>
                <p><strong>Visto em:</strong> ${d.Localizacao}</p>
                <p><span class="relacao" style="${corRelacao}">${d.Relacao || 'Desconhecido'}</span></p>
            </div>
        </div>`;
    });
    document.getElementById("conteudo-npcs").innerHTML = html;
});

// 5. LOJAS
buscarDados(URL_LOJAS, (dados) => {
    let cidades = {};
    
    dados.forEach(d => {
        let nomeCidade = d.Cidade || "Setor Desconhecido"; 
        let logo = d.Logo || "";
        
        if (!cidades[nomeCidade]) cidades[nomeCidade] = {};
        if (!cidades[nomeCidade][d.Nome]) cidades[nomeCidade][d.Nome] = { proprietario: d.Proprietario, logo: logo, itens: [] };
        
        cidades[nomeCidade][d.Nome].itens.push({ item: d.Item, desc: d.Descricao, preco: d.Preco });
    });

    let html = "";
    for (let cidade in cidades) {
        html += `<h3 class="cidade-titulo">📍 ${cidade}</h3>`;
        
        for (let nomeLoja in cidades[cidade]) {
            let loja = cidades[cidade][nomeLoja];
            let htmlLogo = loja.logo ? `<img src="${loja.logo}" class="loja-logo">` : "";
            
            html += `
            <div class="loja-card">
                <div class="loja-header">
                    ${htmlLogo}
                    <div class="loja-titulo">
                        <h4>${nomeLoja}</h4>
                        <p>Proprietário(a): ${loja.proprietario}</p>
                    </div>
                </div>
                <table class="hud-table">
                    <thead><tr><th>Item/Serviço</th><th>Descrição</th><th>Preço</th></tr></thead>
                    <tbody>`;
            
            loja.itens.forEach(i => {
                if(i.item) html += `<tr><td><strong>${i.item}</strong></td><td>${i.desc}</td><td style="color: #ffd700;">${i.preco}</td></tr>`;
            });
            
            html += `</tbody></table></div>`;
        }
    }
    document.getElementById("conteudo-lojas").innerHTML = html;
});

// 6. COFRE
buscarDados(URL_COFRE, (dados) => {
    let html = "";
    dados.forEach(d => {
        html += `<tr><td>${d.Item}</td><td>${d.Quantidade}</td><td style="color: #ffd700;">${d.Valor}</td><td>${d.Portador}</td></tr>`;
    });
    document.getElementById("tabela-cofre").innerHTML = html;
});
