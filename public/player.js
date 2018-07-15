import playlist from "./playlist.js";
import queue from "./queue.js";
import lib from "./lib.js";
var player = {};
var randomCheckbox = "#settings-options-random";

var card = {};
card.form = $("#card-form")[0];
card.pronunciation = $("#card-pronunciation")[0];
card.definition = $("#card-definition")[0];
card.all = [card.form, card.pronunciation, card.definition];

var options = {};
options.random = $("#settings-options-random")[0];
options.form = $("#settings-options-term")[0];
options.pronunciation = $("#settings-options-pronunciation")[0];
options.definition = $("#settings-options-definition")[0];

function changeCard()
{
    $(card.form).toggleClass("hidden", !options.form.checked);
    $(card.pronunciation).toggleClass("hidden", !options.pronunciation.checked);
    $(card.definition).toggleClass("hidden", !options.definition.checked);
    loadCardInfo(queue.getNow());
}

// not all fields are guaranteed, need handle
function loadCardInfo(word)
{
    if (typeof word !== "undefined" && word !== null)
    {
        $(card.all).empty();
        for (var i of word.term)
        {
            for (var j of i.form)
            {
                $(card.form).append(j);
            }
            for (var j of i.pronunciation)
            {
                $(card.pronunciation).append(j);
            }
        }
        for (var i of word.definition)
        {
            var p = document.createElement("p");
            var div = document.createElement("div");
            var ol = document.createElement("ol");
            if (typeof i.partOfSpeech !== "undefined")
            {
                for (var j of i.partOfSpeech)
                {
                    $(div).append(j);
                }
            }
            for (var j of i.meaning)
            {
                $(ol).append("<li>" + j + "</li>");
            }
            $(card.definition).append(p);
            $(p).append(div);
            $(p).append(ol);
            $(div).addClass("partofspeech");
            $(ol).addClass("meaning");
        }
    } else
    {
        $(card.all).text("There are no cards selected.");
    }
}

// what if queue isnt empty
player.next = function ()
{
    if (!playlist.isEmpty())
    {
        if (!queue.hasNext())
        {
            var cards = playlist.getCards();
            if ($(randomCheckbox).prop("checked"))
            {
                cards = _.shuffle(cards);
            }
            queue.addCards(cards);
            //queue.print();// diagnostic
        }
        queue.next();
        changeCard();
    } else
    {
        // alert user is empty
        console.log("playlist empty");
    }
};

player.prev = function ()
{
    if (queue.hasPrev())
    {
        queue.prev();
        changeCard();
    } else
    {
        // what if empty
    }
};

player.remove = function ()
{};

player.reveal = function ()
{
    $(card.all).removeClass("hidden");
};

player.randomChange = function ()
{};

player.loadIndex = function ()
{
    lib.getIndex();
};

// <div data-role="collapsible">
// <h3 fc-bookid="${obj.id}" fc-booktitle="${obj.title}" onclick="player.loadBook($(this).attr('fc-bookid'));">${obj.title}</h3>
// <div id="book-chapter-container-${obj.id}" class="jl-container-flex-1"></div>
// </div>

player.indexcb = function (index)
{
    var libContainer = "#library-container";
    $(libContainer).empty();
    for (var obj of index)
    {
        if (typeof obj === "undefined")
        {
            continue; }
        var bookDiv = $("<div>").appendTo(libContainer).attr("data-role", "collapsible");
        $("<h3>").appendTo(bookDiv).prop("onclick", function ()
        {
            player.loadBook(obj.id);
        }).val(obj.title);
        $("<div>").appendTo(bookDiv).attr("id", `book-chapter-container-${obj.id}`).attr("class", "jl-container-flex-1");
    }
    $(libContainer).enhanceWithin();
};

player.loadBook = function (bookid)
{
    lib.getBook(bookid);
};

// <div class='jl-container-checkbox-1'>
// <input id="" data-role='none' type='checkbox'>
// <label for=""></label>
// </div>

player.bookcb = function (bookObj)
{
    var chaptersContainer = $(`#book-chapter-container-${bookObj.id}`);
    for (var chapterObj of bookObj.chapters)
    {
        if (typeof chapterObj === "undefined")
        {
            continue; }
        var id = bookObj.id + "-" + chapterObj.ordinal;
        var container = $("<div>").appendTo(chaptersContainer).attr("class", "jl-container-checkbox-1");
        $("<input>").appendTo(container).attr("id", id).attr("data-role", "none").attr("type", "checkbox").prop("bookId", bookObj.id).prop("chapterNum", chapterObj.ordinal).prop("onchange", function ()
        {
            player.chapterChange(this.bookId, this.chapterNum);
        });
        $("<label>").appendTo(container).attr("for", id).val(chapterObj.ordinal);
    }
};

player.chapterChange = function (bookId, chapterNum)
{
    if ($("#" + bookId + "-" + chapterNum).prop("checked"))
    {
        var chapter = lib.getChapter(bookId, chapterNum);
        playlist.add(bookId, chapterNum, chapter.cards);
    } else
    {
        playlist.remove(bookId, chapterNum);
    }
    $("#startpage-startbutton").toggleClass("ui-disabled", playlist.isEmpty());
};

player.keydown = function (eventObject)
{
    switch (eventObject.key)
    {
        case "ArrowLeft":
            player.prev();
            break;
        case "ArrowRight":
            player.next();
            break;
        case "ArrowUp":
            player.remove();
            break;
        case "ArrowDown":
            player.reveal();
            break;
    }
};

$(document).on("pagecreate", "#page-library", player.loadIndex);
$(document).keydown(player.keydown);

export default player;