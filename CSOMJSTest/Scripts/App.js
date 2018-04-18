$(document).ready(function () {
    $("#loadButton").click(usingLoad);

    $("#loadQueryButton").click(usingLoadQuery);

    $("#restButton").click(restAPi);

    $("#LoadincludeButton").click(usingLoadInclude);
    $("#NestedincludeButton").click(usingNestedInclude);
    $("#CamlQueryButton").click(usingCamlQuery);
    $("#CreateListButton").click(createList);
    $("#CreateListItemButton").click(createListItem);
    $("#UpdateListItemButton").click(updateListItem);
    $("#WebProxyButton").click(webProxy);
    $("#HostWebButton").click(callToHostWeb);
    $("#Search").click(function () {
        SP.SOD.executeFunc('SP.Search.js', 'Microsoft.SharePoint.Client.Search.Query',search)
    });
});

function usingLoad() {
    var context = SP.ClientContext.get_current()
    var web = context.get_web();
    var lists=web.get_lists()
    context.load(web)
    context.load(lists);
    context.executeQueryAsync(sucess, fail);


    function sucess() {
        var message = $("#message");
        message.text(web.get_title());
        message.append("<br/>");
        message.append(lists.get_count());
    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function usingLoadQuery() {
    var context = SP.ClientContext.get_current()
    var web = context.get_web();
    var lists = web.get_lists()
    var myLists = context.loadQuery(lists)
    //context.load(lists);
    context.executeQueryAsync(sucess, fail);


    function sucess() {
        var message = $("#message");
        //message.text(web.get_title());
        //message.append("<br/>");
        message.text(myLists.length);
    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function restAPi() {
    //var context = SP.ClientContext.get_current()
    //var web = context.get_web();
    //var lists = web.get_lists()
    //var myLists = context.loadQuery(lists)
    ////context.load(lists);
    //context.executeQueryAsync(sucess, fail);
    var call=$.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web",
        type: "GET",
        dataType: "json",
        headers: {
            Accept:"application/json;odata=verbose"
        }
    });

    call.done(function (data, testStatus, jqXHR) {
        var message = $("#message");
        //message.text(web.get_title());
        //message.append("<br/>");
        message.text(data.d.Title);
    });

    call.fail(function (jqXHR, testStatus,errorThrown) {
        var response = JSON.parse(jqXHR.responseText);
        var message = response ? response.error.message.value : null;
        alert("Call failed: " + message);
    });

    
}


function usingLoadInclude() {
    var context = SP.ClientContext.get_current()
    var web = context.get_web();
    var lists = web.get_lists()
    context.load(web,"Title","Description")
    context.load(lists,"Include(Title)");
    context.executeQueryAsync(sucess, fail);


    function sucess() {
        var message = $("#message");
        message.text(web.get_title());
        var lenum = lists.getEnumerator();
        while (lenum.moveNext())
        {
            message.append("<br/>");
            message.append(lenum.get_current().get_title());
        }
        
    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function usingNestedInclude() {
    var context = SP.ClientContext.get_current()
    var web = context.get_web();
    var lists = web.get_lists()
    context.load(web, "Title", "Description")
    context.load(lists, "Include(Title,Fields.Include(Title))");
    context.executeQueryAsync(sucess, fail);


    function sucess() {
        var message = $("#message");
        message.text(web.get_title());
        var lenum = lists.getEnumerator();
        while (lenum.moveNext()) {

            var list = lenum.get_current()
            message.append("<br/>");
            message.append(list.get_title());
            var fenum = list.get_fields().getEnumerator();
            while (fenum.moveNext()) {
                var field = fenum.get_current();
                message.append("<br/>");
                message.append(field.get_title());
            }
        }

    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function usingCamlQuery() {
    var context = SP.ClientContext.get_current()
    var web = context.get_web();
    var list = web.get_lists().getByTitle("Composed Looks");
    
    var query = new SP.CamlQuery();
    query.set_viewXml("<View/>");
    var items = list.getItems(query);
    context.load(web, "Title", "Description")
    context.load(items, "Include(Title)");
    context.executeQueryAsync(sucess, fail);


    function sucess() {
        var message = $("#message");
        message.text(web.get_title());
        var ienum = items.getEnumerator();
        while (ienum.moveNext()) {
            message.append("<br/>");
            message.append(ienum.get_current().get_item("Title"));
        }

    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function createList() {
    var context = SP.ClientContext.get_current()
    var web = context.get_web();
    try {
        var list = null;
        var scope = new SP.ExceptionHandlingScope(context);
        var scopeStart = scope.startScope()

        var scopeTry = scope.startTry();
        list = web.get_lists().getByTitle("Tasks");
        context.load(list);
        scopeTry.dispose();

        var scopeCatch = scope.startCatch();
        var lci = new SP.ListCreationInformation();
        lci.set_title("Tasks");
        lci.set_templateType(SP.ListTemplateType.tasks);
        lci.set_quickLaunchOption(SP.QuickLaunchOptions.on)
         list = web.get_lists().add(lci);
        scopeCatch.dispose()
        //context.load(web)
        //context.load(lists);
        var scopeFinally = scope.startFinally();
        list = web.get_lists().getByTitle("Tasks")
        context.load(list);
        scopeFinally.dispose()

        scopeStart.dispose()

        context.executeQueryAsync(sucess, fail);
    } catch (ex) {
        alert(ex.message)
    }

    
    function sucess() {
        var message = $("#message");

        var status=scope.get_hasException? "List Added" :"List loaded"
        message.text( list.Title + status);
        
    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function createListItem() {
    var context = SP.ClientContext.get_current()
    var web = context.get_web();
    try {
        
        var list = web.get_lists().getByTitle("Tasks");
        var ici = new SP.ListItemCreationInformation();
        var item = list.addItem(ici);
        item.set_item("Title", "Sample task");
        var due = new Date();
        due.setDate(due.getDate() + 7);
        item.set_item("DueDate", due);
        item.update();

        

        context.executeQueryAsync(sucess, fail);
    } catch (ex) {
        alert(ex.message)
    }


    function sucess() {
        var message = $("#message");

        //var status = scope.get_hasException ? "List Added" : "List loaded"
        message.text("Item Added");

    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function updateListItem() {
    var context = SP.ClientContext.get_current()
    var web = context.get_web();
    var items = null;
    try {

        var list = web.get_lists().getByTitle("Tasks");
        var query = new SP.CamlQuery();
        query.set_viewXml("<View><RowLimit>1</RowLimit></View>")
        var qitems = list.getItems(query);
        items = context.loadQuery(qitems);
        context.executeQueryAsync(success1, fail);
      



        context.executeQueryAsync(sucess, fail);
    } catch (ex) {
        alert(ex.message)
    }

    function success1() {
        if (items.length > 0) {
            var item = items[0];
            item.set_item("Status", "In Progress");
            item.set_item("PercentComplete", 0.10);
            item.update();
        }
        context.executeQueryAsync(sucess, fail);
    }
    function sucess() {
        var message = $("#message");

        //var status = scope.get_hasException ? "List Added" : "List loaded"
        message.text("Item Updated");

    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function webProxy() {
    var context = SP.ClientContext.get_current();
    var request = new SP.WebRequestInfo();
    request.set_url("http://services.odata.org/V3/Northwind/Northwind.svc/Categories?$format=json");
    request.set_method("GET");
    var response=SP.WebProxy.invoke(context,request)
    context.executeQueryAsync(sucess, fail);

    function sucess() {
        if (response.get_statusCode() == 200)
        {
            var categories = JSON.parse(response.get_body());
            var message = $("#message");
            message.text("Categories in  the remote NorthWind service");
            message.append("<br/>");
            $.each(categories.value, function (index, value) {

                message.append(value.CategoryName);
                message.append("<br/>");
            }
                )
            

        } else {

            var errorMessage = response.get_body();
            alert(errorMessage);

        }

        
    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

function callToHostWeb() {
    var hosturl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    var context = SP.ClientContext.get_current();
    var hostContext = new SP.AppContextSite(context, hosturl);
    var web = hostContext.get_web();
    var list = web.get_lists().getByTitle("ColumnFormatter");
    var query = new SP.CamlQuery();
    query.set_viewXml("<View />")
    var qitems = list.getItems(query);
    items = context.loadQuery(qitems,"Include(Title)");
    context.executeQueryAsync(success, fail);
    function success() {
        var message = $("#message");
        message.text("Column Formatter values  in  the Host List");
        message.append("<br/>");
        $.each(items, function (index, value) {

            message.append(value.get_item("Title"));
            message.append("<br/>");
        }
        )
    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}


function getQueryStringParameter(paramToRetrieve) {
    var params = document.URL.split("?")[1].split("&");
    var strParams = "";

    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}


function search() {
    var context = SP.ClientContext.get_current();

    var queryText = "Customer";

    var query =new Microsoft.SharePoint.Client.Search.Query.KeywordQuery(context);
    query.set_queryText(queryText);

    var exec = new Microsoft.SharePoint.Client.Search.Query.SearchExecutor(context);

    var results = exec.executeQuery(query);


    context.executeQueryAsync(success, fail);

    function success() {
        var message = $("#message");

        //var status = scope.get_hasException ? "List Added" : "List loaded"
        message.text("Search results for \"" + queryText + "\"");
        message.append("<br/>");

        var rows = results.m_value.ResultTables[0].ResultRows;
        $.each(rows, function (index, value) {
            message.append(value.Title+": "+value.Path);
            message.append("<br/>");
        })
    }

    function fail(sender, args) {
        alert("Call failed. Error: " + args.get_message());
    }
}

