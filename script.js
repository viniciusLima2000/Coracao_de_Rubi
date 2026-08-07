const URL_MISSOES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1467808186&single=true&output=csv";
const URL_NPCS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1594591693&single=true&output=csv";
const URL_LOJAS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=795858506&single=true&output=csv";
const URL_COFRE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1380957419&single=true&output=csv";
const URL_DIARIO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvchGYHv9__zSXKitaVxEwYLgm6yYrEdc6WnnkYLj6oIMq2USYiEu9KR-wF56A/pub?gid=1401896465&single=true&output=csv";

function buscarDados(url, callback) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
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
            <p class="diario-meta">Data: ${d.DataArton} | Por: ${d.Autor}</p>
            <div class="diario-texto"><p>${d.Resumo ? d.Resumo.replace(/\n/g, '<br>') : ''}</p></div>
        </div>`;
    });
    document.getElementById("conteudo-diario").innerHTML = html;
});

// 2. MISSÕES (O Carrossel de Folhetos)
buscarDados(URL_MISSOES, (dados) => {
    let html = "";
    dados.forEach(d => {
        let corStatus = d.Status === "Concluída" ? "#006400" : (d.Status === "Em Andamento" ? "#b8860b" : "#8B0000");
        html += `
        <div class="folheto">
            <h3 class="missao-titulo">${d.Titulo}</h3>
            <p><strong>Solicitante:</strong><br>${d.Solicitante}</p>
            <p><strong>Local:</strong><br>${d.Local}</p>
            <p><strong>Nível de Perigo:</strong><br>${d.Perigo}</p>
            <p><strong>Recompensa:</strong><br>${d.Recompensa}</p>
            <div class="status-missao" style="color: ${corStatus}; border-color: ${corStatus};">
                ${d.Status}
            </div>
        </div>`;
    });
    document.getElementById("quadro-missoes").innerHTML = html;
});

// 3. NPCs
buscarDados(URL_NPCS, (dados) => {
    let html = "";
    dados.forEach(d => {
        let imagemUrl = d.Imagem ? d.Imagem : "https://via.placeholder.com/250x300/3d2616/eedba5?text=Rosto+Desconhecido";
        let corRelacao = d.Relacao === "Inimigo" ? "color:#8B0000; border-color:#8B0000; background:rgba(139,0,0,0.1);" : 
                        (d.Relacao === "Aliado" ? "color:#006400; border-color:#006400; background:rgba(0,100,0,0.1);" : "color:#555; border-color:#555;");
        
        html += `
        <div class="npc-card">
            <div class="npc-foto" style="background-image: url('${imagemUrl}');"></div>
            <div class="npc-info">
                <h4>${d.Nome}</h4>
                <p><em>${d.Ocupacao}</em></p>
                <p>📍 ${d.Localizacao}</p>
                <span class="relacao" style="${corRelacao}">${d.Relacao || '?'}</span>
            </div>
        </div>`;
    });
    document.getElementById("conteudo-npcs").innerHTML = html;
});

// 4. LOJAS (Agrupadas por cidade)
buscarDados(URL_LOJAS, (dados) => {
    let cidades = {};
    dados.forEach(d => {
        let nomeCidade = d.Cidade || "Região Desconhecida"; 
        if (!cidades[nomeCidade]) cidades[nomeCidade] = {};
        if (!cidades[nomeCidade][d.Nome]) cidades[nomeCidade][d.Nome] = { proprietario: d.Proprietario, itens: [] };
        cidades[nomeCidade][d.Nome].itens.push({ item: d.Item, desc: d.Descricao, preco: d.Preco });
    });

    let html = "";
    for (let cidade in cidades) {
        html += `<h3 style="font-family:'MedievalSharp'; color:#8B0000; border-bottom:2px solid; margin-top:30px;">🏰 ${cidade}</h3>`;
        for (let nomeLoja in cidades[cidade]) {
            let loja = cidades[cidade][nomeLoja];
            html += `
            <div style="margin-bottom:25px; padding:15px; background:rgba(0,0,0,0.05); border:1px solid #c2a77d; border-radius:5px;">
                <h4 style="margin:0 0 5px 0; font-size:1.3rem; font-family:'MedievalSharp'; color:#6b4423;">${nomeLoja}</h4>
                <p style="margin:0 0 15px 0; font-style:italic; font-size:0.9rem;">Proprietário(a): ${loja.proprietario}</p>
                <div class="wrapper-tabela">
                    <table class="tabela-medieval">
                        <thead><tr><th>Mercadoria/Serviço</th><th>Descrição</th><th>Preço</th></tr></thead>
                        <tbody>`;
            loja.itens.forEach(i => {
                if(i.item) html += `<tr><td><strong>${i.item}</strong></td><td>${i.desc}</td><td>${i.preco}</td></tr>`;
            });
            html += `</tbody></table></div></div>`;
        }
    }
    document.getElementById("conteudo-lojas").innerHTML = html;
});

// 5. COFRE
buscarDados(URL_COFRE, (dados) => {
    let html = "";
    dados.forEach(d => {
        html += `<tr><td>${d.Item}</td><td>${d.Quantidade}</td><td>${d.Valor}</td><td>${d.Portador}</td></tr>`;
    });
    document.getElementById("tabela-cofre").innerHTML = html;
});
