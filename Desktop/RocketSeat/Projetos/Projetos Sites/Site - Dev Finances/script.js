const Modal = { // constante para trabalharmos a funcionalidade do Modal
    open() { // função para abrir o modal active do html; para isso devemos adicionar a class active ao modal
        document // usamos o document para acessar um arquivo inteiro (html no caso)
            .querySelector('.modal-overlay') // usamos o querySelector para acessar o seletor escolhido (modal-overlay no caso)
            .classList // comando para acessar a ação que faremos em uma classe do html
            .add('active') // nesse comando, o JavaScript vai adicionar a classe active ao modal-overlay 
    },

    close() { // função para fechar o modal active do html; para isso devemos remover a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active') // nesse comando, o JavaScript vai remover a classe active ao modal-overlay 
    }
}

const Storage = { // constante que faz com que os dados inputados fiquem armazenados no navegador
    get() {
        return JSON.parse(localStorage.getItem("dev.finances.transactions")) || []; // .parse transforma uma string JSON em um array; vai retornar os dados da chave dev.finances.transactions ou um array vazio
    },

    set(transactions) {
        localStorage.setItem("dev.finances.transactions", JSON.stringify(transactions)); // pega o array com os valores do transaction e transforma em uma string do tipo JSON (no primeiro argumento colocamos o nome da chave que quisermos ("dev.finances.transactions", no caso) e no segundo colocamos o valor que será atribuido a essa chave)
    }
}

const Transaction = {
    all: Storage.get(), // salva os dados inputados pelo usuário no localStorage do navegador

    add(transaction) { // função para adicionar uma transação quando o usuário der input no site
        Transaction.all.push(transaction) // push pega informações e coloca em um array

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1) //splice remove ou adiciona um elemento de um array; o index vai receber a posição do array e o "1" depois da vírgula é a quantidade de elementos que será removido

        App.reload()
    },

    incomes() { //somar todas as entradas (valores positivos)
        let income = 0;
        Transaction.all.forEach((transaction) => { // para cada transação
            if(transaction.amount > 0) {
                income += transaction.amount; // soma os amounts do transaction e retorna o valor
            }
        })
        return income;
    },

    expenses() { //somar todas as saídas (valores negativos)
        let expense = 0;
        Transaction.all.forEach((transaction) => { // para cada transação
            if(transaction.amount < 0) {
                expense += transaction.amount; // soma os amounts do transaction e retorna o valor
            }
        })
        return expense;
    },

    total() { //entradas - saídas
        return total = (this.incomes() + this.expenses()); //usamos o 'this' para puxar uma função de dentro da mesma estrutura; poderíamos ter escrito total = Transaction.incomes() + Transaction.expenses() 
    }
}

const DOM = { // DOM e a constante que serve para conversarmos entre o HTML e o JavaScript
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index 
        
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) { // função responsável por criar o HTML com os dados inputados pelo usuário
        const CSSclass = transaction.amount > 0 ? "income" : "expense"; // função que determina qual classe atribuir à variável amount de acordo com seu valor (maior ou menor que 0); ? = então e : = senão

        const amount = Utils.formatCurrency(transaction.amount); // criamos essa constante com a const Utils junto à função formatCurrency para ela retornar o valor com o R$ e o sinal de (-)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img class="cancel image" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Logo Menos">
            </td>
        ` 

        return html; //temos que usar o return para que o que estiver dentro de uma função possa ser usado fora dela
    },
    
    updateBalance() { // função para pegar os dados das funções Transaction e jogar na tela 
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes()) // usamos Utils.formatCurrency para identar os valores
        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "" // função para limpar as linhas de dados inputados pelo formulário
    }
}

const App = { // constante para rodar a aplicação de input do formulário no site
    init() {
        Transaction.all.forEach((transaction, index) => { // código para preencher os dados e inputar na tela do usuário
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance() // função que atualiza a parte dos cards

        Storage.set(Transaction.all) // atualiza o localStorage
    },

    reload() {
        DOM.clearTransactions() // colocamos essa função para que o App só crie jogue os inputs uma vez na tela
        App.init()
    }
}

const Form = { // constante para formatar o preenchimento do formulário
    description: document.querySelector('input#description'), // pega os valores inputados pelo usuário nos campos description, amount e date
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() { // função que recebe um objeto com os valores inputados
        return {
            description: this.description.value, // usamos o .value para receber somente os valores inputados
            amount: this.amount.value,
            date: this.date.value,
        }
    },

    formatValues() { // formatar os dados para salvar 
        let { description, amount, date } = this.getValues(); // usamos o let pois se usássemos const não conseguiríamos alterar o valor das variáveis

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateFields() { // verificar se todas as informações foram preenchidas
        const { description, amount, date } = Form.getValues()
        
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {  // trim faz uma limpeza dos espaços vazios que existe na string
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    clearFields() { 
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault() // faz com que a aplicação não faça o comportamento padrão de enviar vários dados pré-definidos na DOM do JS

        try { // tentamos todos os passos no "try"; se algum deles falhar, capturamos o erro do catch new Error
            Form.validateFields()

            const transaction = Form.formatValues()

            Transaction.add(transaction) // usamos essa função que já estava pronta para salvarmos os valores inputados pelo usuário

            Form.clearFields() // função para apagar os dados dos campos do formulário

            Modal.close() // fecha o modal assim que clicamos no salvar

            } catch (error) {

            alert(error.message) // mensagem mostrada no browser (navegador) com a mensagem de erro descrita no throw new Error
        }
     
      }
}

const Utils = { // função para transformar a string do amount colocada pelo usuário para que fique com a modelagem perfeita

    formatDate(date) { // por padrão do navegador, as datas são retornadas no console invertidas Ex: 2022-08-21; temos que arrumar isso para retornar certo 21/08/2022
        const splittedDate = date.split("-"); // split separa uma string em um array, onde os objetos do array são as strings entre o argumento de separação
        
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatAmount(value) {
        value = value * 100; // multiplicamos por 100 para que, quando os dados entrarem no formatCurrency, ele divida por 100 novamente e coloque a vírgula
        
        return Math.round(value);
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "" //tranformamos a variável em número com o Number e adicionamos o sinal de - se ele for negativo

        value = String(value).replace(/\D/g, "") //transforma a value em uma string e substitui qualquer caractere que não seja um número por o que vier entre as "" (no caso, vazio); resumindo: remove qualquer caractere especial

        value = Number(value) / 100; // dividimos por 100 para adicionar os valores dos centavos

        value = value.toLocaleString('pt-BR', { // temos que identificar para o código que estamos usando a linguagem português do Brasil
                style: "currency", // currency = estilo moeda
                currency: 'BRL'    // identamos que o currency referenciado acima é do tipo R$ (js adiciona automático)
        })

        return signal + value 
    }
}

App.init()

