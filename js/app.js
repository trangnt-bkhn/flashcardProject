//event listeners - will be invoked after DOM Content is loaded
function eventListeners(){
    const showBtn = document.getElementById("show-btn");
    const questionCard = document.querySelector(".question-card");
    const closeBtn = document.querySelector(".close-btn");
    const form = document.getElementById("question-form");
    const feedback = document.querySelector(".feedback");
    const questionInput = document.getElementById("question-input");
    const answerInput = document.getElementById("answer-input");
    const ownerInput = document.getElementById("owner-input");
    const questionList = document.getElementById("questions-list");
    const sortBy = document.getElementById("sortBy");
    //let data = [];
    let id;

    //new ui instance
    const ui = new UI();
    //retrieve questions from local storage
    let data = ui.retrieveLocalStorgage();
    if (data.length > 0){
        let maxId = 0;
        for (let i = 0; i < data.length; i++) {
            if (maxId < data[i].id) {
                maxId = data[i].id;
            }
        }
        id = maxId + 1;
        //id = (data[(data.length-1)].id)+1;
    } else {
        id = 1;
    }
    data.forEach(function(question){
        ui.addQuestion(questionList, question);
    })
    //show question form
    showBtn.addEventListener('click', function(){
        ui.showQuestion(questionCard);
    });
    //hide question form
    closeBtn.addEventListener('click', function(){
        ui.hideQuestion(questionCard);
    });
    //add question
    form.addEventListener('submit', function(event){
        event.preventDefault();

        const questionValue = questionInput.value;
        const answerValue = answerInput.value;
        const ownerValue = ownerInput.value;

        if (questionValue === '' || answerValue === '' || ownerValue === ''){
            feedback.classList.add('showItem', 'alert-danger');
            feedback.textContent = 'cannot add empty values';

            // setTimeout(function(){
            //     feedback.classList.remove('alert-danger', 'showItem');    
            // }, 3000)
        } else {
            feedback.classList.remove('alert-danger', 'showItem');
            const question =  new Question(id, questionValue, answerValue, ownerValue);
            data.push(question);

            // check existing owner cases

            data.sort(function(a,b) {
                var nameA = a.owner.toUpperCase(); // ignore upper and lowercase
                var nameB = b.owner.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                } else if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });

            let index = 0;
            for( ; index < data.length; index++) {
                console.log(data[index].id);
                if (data[index].id === id) {
                    break;
                }
            }

            ui.addToLocalStorage(data);
            id++;
            ui.addQuestion(questionList, question, index)
            ui.clearFields(questionInput, answerInput, ownerInput);
        }
    });

    sortBy.addEventListener('change', function(event) {
        let typeSort = sortBy.value;
        if (typeSort === 'sortByID') {
            data.sort(function(a,b) {
                return a.id - b.id;
            });
            ui.addToLocalStorage(data);

            questionList.querySelectorAll("*").forEach(n => n.remove());

            data.forEach(function(question){
                ui.addQuestion(questionList, question);
            })
            //location.reload();
        } else if (typeSort === 'sortByOwner') {
            data.sort(function(a,b) {
                var nameA = a.owner.toUpperCase(); // ignore upper and lowercase
                var nameB = b.owner.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                } else if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
            ui.addToLocalStorage(data);

            questionList.querySelectorAll("*").forEach(n => n.remove());

            data.forEach(function(question){
                ui.addQuestion(questionList, question);
            })

            // location.reload();
        }
    });

    //work with a question
    questionList.addEventListener('click', function(event){
        event.preventDefault();
        if (event.target.classList.contains('delete-flashcard')){
            let id = event.target.dataset.id;

            questionList.removeChild(event.target.parentElement.parentElement.parentElement);
            // rest of data
            let tempData = data.filter(function(item){
                return item.id !== parseInt(id);
            });
            data = tempData;
            ui.addToLocalStorage(data);

        } else if (event.target.classList.contains('show-answer')){
                event.target.nextElementSibling.classList.toggle('showItem');
        } else if (event.target.classList.contains('edit-flashcard')){
            //delete question from DOM
            let id = event.target.dataset.id;
            questionList.removeChild(event.target.parentElement.parentElement.parentElement);

            //show question in question card
            ui.showQuestion(questionCard);
            //find specific question clicked
            const tempQuestion = data.filter(function(item){
                return item.id === parseInt(id);
            });
            // rest of data
            let tempData = data.filter(function(item){
                return item.id !== parseInt(id);
            });
            data = tempData;
            questionInput.value = tempQuestion[0].title;
            questionInput.value = tempQuestion[0].answer;
        } else if (event.target.classList.contains('move-flashcard')){
            let id = event.target.dataset.id;
            // remove element trigged by onclick event
            questionList.removeChild(event.target.parentElement.parentElement);
            
            // create new element, which is removed at above step, at the end of the question-list.
            let ind = 0;
            for( ; ind < data.length; ind++) {
                console.log(data[ind].id);
                if (data[ind].id === parseInt(id)) {
                    break;
                }
            }
            let question = data[ind];
            ui.addQuestion(questionList, question, data.length - 1);

            for( let i = ind; i < data.length-1; i++) {
                data[i] = data[i+1];
            }
            data[data.length-1] = question;
            ui.addToLocalStorage(data);
        }
    });
}



//Contructor function responsible for the display
function UI(){
    //show question card
    UI.prototype.showQuestion = function(element){
        element.classList.add('showItem');
    }
    //hide question card
    UI.prototype.hideQuestion = function(element){
        element.classList.remove('showItem');
    }
    //add question
    UI.prototype.addQuestion = function(element, question, index){
        const div = document.createElement('div');
        div.classList.add('col-md-4');
        div.innerHTML = `<div class="card card-body flashcard my-3">
        <div class="flashcard-btn d-flex justify-content-between">
            <h4 class="text-capitalize">${question.title}</h4>
            <h4 class="text-capitalize">${question.owner}</h4>
        </div>
        <a href="#" class="text-capitalize my-3 show-answer">Show/Hide Answer</a>
        <h5 class="answer mb-3">${question.answer}</h5>
        <div class="flashcard-btn d-flex justify-content-between">
   
         <a href="#" id="edit-flashcard" class=" btn my-1 edit-flashcard text-uppercase" data-id="${question.id}">edit</a>
         <a href="#" id="delete-flashcard" class=" btn my-1 delete-flashcard text-uppercase" data-id="${question.id}">delete</a>
            
        <div class="popover">You are deleting question ID: ${question.id}</div>

        </div>
        <a href="#" id="move-flashcard" class=" btn my-1 move-flashcard text-uppercase" data-id="${question.id}">move last</a>
       </div>`;
       //element.appendChild(div);

       element.insertBefore(div, element.children[index]);
    }
    //add to Local Storage
    UI.prototype.addToLocalStorage = function(data){
        //localStorage.clear();
        const dataJSON = JSON.stringify(data);
        localStorage.setItem('flash-questions', dataJSON)
    }
    //retrieve from localStorage
    UI.prototype.retrieveLocalStorgage = function(){

        let savedQuestions = localStorage.getItem('flash-questions');
        if (savedQuestions){
            const savedQuestionsParsed = JSON.parse(savedQuestions);
            return savedQuestionsParsed;
        } else {
            return savedQuestions = [];
        }
    }

    //clear fields
    UI.prototype.clearFields = function(question, answer, owner){
        question.value = '';
        answer.value = '';
        owner.value = '';

    }
}
//Constructor function responsible for each question
function Question(id, title, answer, owner){
    this.id = id;
    this.title = title;
    this.answer = answer;
    this.owner = owner;
}
// dom event listener to run when content is loaded
document.addEventListener('DOMContentLoaded', function(){
    eventListeners();
})