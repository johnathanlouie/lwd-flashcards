import playlist from "./playlist.js";
import queue from "./queue.js";
import lib from "./lib.js";

let randomCheckbox = $("#settings-options-random");
let libContainer = $("#library-container");

let card = {};
card.form = $("#card-form")[0];
card.pronunciation = $("#card-pronunciation")[0];
card.definition = $("#card-definition")[0];
card.all = [card.form, card.pronunciation, card.definition];

let options = {};
options.random = $("#settings-options-random")[0];
options.form = $("#settings-options-term")[0];
options.pronunciation = $("#settings-options-pronunciation")[0];
options.definition = $("#settings-options-definition")[0];

function changeCard()
{
    $(card.form).toggleClass("hidden", !options.form.checked);
    $(card.pronunciation).toggleClass("hidden", !options.pronunciation.checked);
    $(card.definition).toggleClass("hidden", !options.definition.checked);
    loadCardInfo(queue.get());
}

// not all fields are guaranteed, need handle
function loadCardInfo(word)
{
    if (word)
    {
        $(card.all).empty();
        for (let i of word.term)
        {
            for (let j of i.form)
            {
                $(card.form).append(j);
            }
            for (let j of i.pronunciation)
            {
                $(card.pronunciation).append(j);
            }
        }
        for (let i of word.definition)
        {
            let p = document.createElement("p");
            let div = document.createElement("div");
            let ol = document.createElement("ol");
            if (typeof i.partOfSpeech !== "undefined")
            {
                for (let j of i.partOfSpeech)
                {
                    $(div).append(j);
                }
            }
            for (let j of i.meaning)
            {
                $(ol).append("<li>" + j + "</li>");
            }
            $(card.definition).append(p);
            $(p).append(div);
            $(p).append(ol);
            $(div).addClass("partofspeech");
            $(ol).addClass("meaning");
        }
    }
    else
    {
        $(card.all).text("Out of cards");
    }
}

// what if queue isnt empty
function next()
{
    if (!playlist.isEmpty())
    {
        if (!queue.hasNext())
        {
            let cards = playlist.getCards();
            if (randomCheckbox.prop("checked"))
            {
                cards = _.shuffle(cards);
            }
            queue.addCards(cards);
            //queue.print();// diagnostic
        }
        queue.next();
        changeCard();
    }
    else
    {
        // alert user is empty
        console.log("playlist empty");
    }
}

function prev()
{
    if (queue.hasPrev())
    {
        queue.prev();
        changeCard();
    }
    else
    {
        // what if empty
    }
}

function remove()
{

}

function reveal()
{
    $(card.all).removeClass("hidden");
}

function listBooks(error, index)
{
    libContainer.empty();
    for (let book of index)
    {
        let chaptersDiv = $("<div>");
        let header = $("<h3>");
        let bookDiv = $("<div>");
        function listChapters(error, chapters)
        {
            for (let chapter of chapters)
            {
                let container = $("<div>");
                let checkbox = $("<input>");
                let label = $("<label>");
                function onCheckbox()
                {
                    function cb(error, cards)
                    {
                        playlist.add(chapter._id, cards);
                        $("#startpage-startbutton").toggleClass("ui-disabled", playlist.isEmpty());
                    }
                    if (checkbox.prop("checked"))
                    {
                        lib.getChapter(chapter._id, cb);
                    }
                    else
                    {
                        playlist.remove(chapter._id);
                        $("#startpage-startbutton").toggleClass("ui-disabled", playlist.isEmpty());
                    }
                }
                let checkboxId = `checkbox-${chapter._id}`;
                let checkboxAttr = {
                    "id": checkboxId,
                    "data-role": "none",
                    "type": "checkbox"
                };
                checkbox.attr(checkboxAttr).change(onCheckbox).appendTo(container);
                label.attr("for", checkboxId).text(chapter.ordinal).appendTo(container);
                container.addClass("jl-container-checkbox-1").appendTo(chaptersDiv);
            }
        }
        header.text(book.title).click(() => lib.getBook(book._id, listChapters)).appendTo(bookDiv);
        chaptersDiv.addClass("jl-container-flex-1").appendTo(bookDiv);
        bookDiv.attr("data-role", "collapsible").appendTo(libContainer);
    }
    libContainer.enhanceWithin();
}

function keydown(eventObject)
{
    switch (eventObject.key)
    {
        case "ArrowLeft":
            prev();
            break;
        case "ArrowRight":
            next();
            break;
        case "ArrowUp":
            remove();
            break;
        case "ArrowDown":
            reveal();
            break;
    }
}

$("#button-prev").click(prev);
$("#button-next").click(next);
$("#button-remove").click(remove);
$("#button-reveal").click(reveal);
$("#startpage-startbutton").click(next);

$(document).on("pagecreate", "#page-library", () => lib.getIndex(listBooks));
$(document).keydown(keydown);