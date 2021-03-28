console.log("biztobiz utils loaded");

var scope;
var nrContent = 0;

app.controller('mainCt', ['$scope', '$http', '$interval', '$q', 'uiGridConstants', function ($scope, $http, $interval, $q, uiGridConstants) {
    scope = $scope;
}]).directive('div', function ($compile, $parse) {
    return {
        restrict: 'E',
        link: function (scope, element, attr) {
            scope.$watch(attr.content, function () {
                
                if ($parse(attr.content)(scope) != undefined) {
                    element.html($parse(attr.content)(scope));
                    $compile(element.contents())(scope);
                    setDropdown();
                    SetDistribuitoriAcces(true);
                }
            }, true);
        }
    }
});

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};
var nLoading = 0;
function ShowLoading() {
    nLoading++;
    //loadingIndicator.Show();
 
}

function IncarcaDetaliiModica(idComanda) {
    var result = [];
    var data = JSON.stringify({
        idComanda: idComanda
    });
    $.ajax({
        type: "POST",
        url: "../Sessionless/GetModicaComanda",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (msg) {
            for (v in msg) {
                msg[v].BBDMinim = moment(msg[v].BBDMinim).format("DD.MM.YYYY");
            }
            result = msg;
        },
        complete: function () {
        },
        error: function (xhr, ajaxOptions, thrownError) {
        }
    });
    return result;
}


function getProduseComandateLocal() {
    try {
        var produse = localStorage.getItem('prodcom_' + $("#cmbPunctLucru").val() + "_" + getIdComanda());
        if (getIdComanda() > 0 && (produse == null||produse=="1")) {
            return null;
        }
        if (produse != null && produse != "null"&&produse!="1") {          
            return JSON.parse(produse);
        }
    }
    catch (ex) {
        if (getIdComanda() > 0) {         
            return null;
        }
    }
    return [];
}

function GetIdContract() {
    return $("#cmbContract").length > 0 && $("#cmbContract").val() != null && $("#cmbContract").val() != "" ? $("#cmbContract").val() : 0;
}

function SaveComandaSession(result, del, resultSt) {
    if (getIsRezervareStoc()!=true) {
         
        return true;
    }
    var ok = false;
    var list = [];
    var keys = [];
    ShowLoading();
    var nr = 1;
    var idPc = GetClient().IdPunctLucru;
    if (resultSt != null) {
        $.each(resultSt, function () {
            list.push({
                IdComandaDetailSession: (this.IdComandaDetailSession != null ? this.IdComandaDetailSession : 0),
                IdProdus: this.IdProdus,
                IdDistribuitor: this.IdDistribuitor,
                IdComandaClient: getIdComanda(),
                IdStoc: this.IdStoc,
                IdGestiune: this.IdGestiune,
                State: 3
            });
        });
    }
    $.each(result, function () {
        this.IdComandaDetailTemp = nr;
        list.push({
            IdComandaDetailSession: (this.IdComandaDetailSession != null ? this.IdComandaDetailSession : 0),
            IdProdus: this.IdProdus,
            Cantitate: this.Comandat,
            IdDistribuitor: this.IdDistribuitor,
            IdComandaDetailTemp: this.IdComandaDetailTemp,
            IdGestiune: this.IdGestiune,//(this.IdGestiune == 0 && this.IdGestiuneOld != null ? this.IdGestiuneOld : this.IdGestiune),
            IdPunctLucru: idPc,
            BBD: this.BBDMinim,
            IdComandaClient: getIdComanda(),
            IdStoc: this.IdStoc,
            State: del == true ? 3 : 0,
            IdContract:GetIdContract()
        });

        keys[this.IdComandaDetailTemp] = this;
        nr++;
    });
    if (list.length == 0) {
        list.push({
            IdComandaClient: getIdComanda()
        });
    }
    var data = JSON.stringify({
        list: list

    });
    $.ajax({
        type: "POST",
        url: "../Comanda/SaveComandaSession",
        data: data,
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            var strMesajEroare = '';
          
            $.each(msg, function () {
                var idS = this.IdComandaDetailSession;
                var idT = this.IdComandaDetailTemp;
                keys[idT].IdComandaDetailSession = idS;
                keys[idT].CantitateLivrata = this.CantitateLivrata;
                
                keys[idT].CantitateRamasaLivrat = this.CantitateRamasaLivrat;   
                if (this.MesajEroare != null) {
                    keys[idT].StocZero = true;
                    strMesajEroare += this.MesajEroare + "<br/>";
                }
                else {
                    keys[idT].StocZero = null;
                }
            });
            if (strMesajEroare != "") {
                alertErorr(strMesajEroare);
            }
            ok = true;
        },
        complete: function () {
            HideLoading();
        }

    });
    if (ok == false) {
        Detalii = getProduseComandateLocal();
    }
    return ok;
}
function LoadCMB(cmb, url, parameter, divLoading, id, text) {
    try {
        var list = new Array;
        var listComplete = [];
        var promise = $.ajax({
            type: "POST",
            url: url,
            data: parameter,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (msg) {
                try {
                    var str = "";// "<option value='' ></option>";
                    $.each(msg, function (i, item) {
                        var idT = eval("item." + id);
                        var label = eval("item." + text);
                        str += "<option value='" + idT + "' >" + label + "</option>";
                        list.push({
                            key: idT,
                            labelT: label
                        });
                        listComplete[idT] = item;
                    });
          

                    $("#" + cmb).html(str);
                    $("#" + cmb).chosen();
                    $("#" + cmb).trigger("chosen:updated");
                }
                catch (ex) {
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                Eroare(xhr);
            },
            complete: function () {
                $("#" + cmb).trigger({
                    type: "onLoadCb",
                    list: list,
                    listComplete: listComplete
                });
            }
        });
        return promise.promise();
    }
    catch (ex) {
    }
}

function HideLoading() {
    nLoading--;
    if (nLoading < 1) {
     //   loadingIndicator.Hide();
    }
  
}

function alertErorr(mesaj) {
    alertErorr(mesaj, null);
}

function alertErorr(mesaj,succes) {
    try {
        var dialoga = bootbox.dialog({
            message: '<p>' + mesaj+'</p>',
            title: Eroare,

            buttons: {
                success: {
                    label: "OK",
                    className: "btn-danger okerr",
                    callback: function () {
                      if(succes!=null)  succes();
                    }
                }
            }
        });

        dialoga.on("shown.bs.modal", function () {
            $(".btn-danger.okerr").focus();
        });
    } catch (ex) {
    }
}

function alertInfo(mesaj) {
    alertInfo(mesaj, null);
}

function alertInfo(mesaj, succes) {
    try {
        var dialoga = bootbox.dialog({
            message: '<p>' + mesaj + '</p>',
            title: Informare,

            buttons: {
                success: {
                    label: "OK",
                    className: "btn-warning okerr",
                    callback: function () {
                        if (succes != null) succes();
                    }
                }
            }
        });

        dialoga.on("shown.bs.modal", function () {
            $(".btn-warning.okerr").focus();
        });
    } catch (ex) {
    }
}

function alertSucces(mesaj, ok) {
    try {
    var dialoga=  bootbox.dialog({
            message: mesaj,
            title: Informare,

            buttons: {
                success: {
                    label: "OK",
                    className: "btn-success oksucc",
                    callback: function () {
                        if (ok != undefined) {
                            ok();
                        }
                    }
                }
            }
        });

        dialoga.on("shown.bs.modal", function () {
            $(".btn-success.oksucc").focus();
        });
    } catch (ex) {

    }
}

function alertConfirm(mesaj, ok) {
    alertConfirm(mesaj, ok, Sterge);
}

function alertConfirm(mesaj, ok,button) {
    alertConfirm(mesaj, ok, button, null);
}
function alertConfirm(mesaj, ok, button, cancel) {
    var dialoga = bootbox.dialog({
        message: "<span class='bigger-110'>" + mesaj + "</span>",
        title: "",
        callback: function (result) {
            alert("aaa");
        },
        closeButton: false,
        buttons:
        {
            danger:
            {
                label: "<i class='icon-save'></i>" + (button || Sterge),
                className: "btn btn-primary",
                callback: function () {
                    if (ok != undefined) {

                        ok();
                    }
                }
            },
            succes:
            {
                label: "<i class='icon-remove'></i>" + Nu,
                className: "btn btn-outline-primary",
                callback: function () {
                    if (cancel != undefined) {

                        cancel();
                    }
                }
            }
        }
    });
    dialoga.on("shown.bs.modal", function () {
        $(".btn-sm.btn-info.ok").focus();
    });
}
function setDropdown() {
    $('.dropdown-menu').on('click', function (event) {
        event.stopPropagation();
    });
}
$(document).ready(function() {
    try {
        setDropdown();
        setControls();
        $('.date-picker').datepicker({ autoclose: true }).next().on(ace.click_event, function () {
            $(this).prev().focus();
        });
    } catch (ex) {
    }
});


//function setControls() {
//    $(".chosen-select").chosen();
//}

var showErorr = true;
$(document).ajaxError(function (xhr, ajaxOptions, thrownError,aa) {
    try {
        if (showErorr) {
            if (ajaxOptions.responseText == '"SESSION"' || ajaxOptions.responseText == "SESSION" || aa == "SESSION") {
                window.location.href = logoutUrl;
            } else {
                if (aa != "SyntaxError: JSON.parse: unexpected character at line 2 column 1 of the JSON data" && aa !="SyntaxError: Unexpected token < in JSON at position 2")
                    alertErorr(aa, function () {
                        setTimeout(function () {
                            try {
                                SetFocusGrid();
                            }
                            catch (exx) {
                                
                            }
                        }, 50);

                       
                    });
            }
        }
    } catch (ex) {
    }
});

function setTitleTable(id, title) {
    $(id).html(title);
    $(id).css("float", "left");
    $(id).css("text-align", "left");
}

String.prototype.toDateFromAspNetD = function () {
    var dte = eval("new " + this.replace(/\//g, '') + ";");
    return dte;
}

function fnGetSelected(oTableLocal) {
    return oTableLocal.$('tr.row_selected');
}

function numericInteger() {
    return /^[0-9]{1,9}$/;
}

function isNormalInteger(str) {
    var n = ~~Number(str);
    return String(n) === str && n >= 0;
}

function roundToTwo(value) {
    return +(Math.round(value + "e+2") + "e-2");
}

function isNumber(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
}

function ScrollToRow(table, row) {
    var container = $('#' + table + ',div.dataTables_scrollBody');
    container.scrollTop($(row).offset().top - container.offset().top-400);
}

function getUrlVars() {
    return getUrlVarsS(window.location.href);
}

function getUrlVarsS(str) {
    var vars = {};
    var parts = str.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value.replaceAll("%20", " ");
    });
    return vars;
}

function GetClient() {
    var o = new Object;
    if ($("#cmbPunctLucru").val() == null || $("#cmbPunctLucru").val() == "") {
        o.IdPunctLucru = -1;
        o.IdFirma = -1;

    } else {
        o.IdPunctLucru = $("#cmbPunctLucru").val().split("-")[0];
        o.IdFirma = $("#cmbPunctLucru").val().split("-")[1];
    }
  
    o.IdBanner = getUrlVars()["IdBanner"] || 0;
    o.IdNotificare = getUrlVars()["IdNotificare"] || 0;
    o.IdOferta = getUrlVars()["IdOferta"] || 0;

 
    return o;
}

function setDate(dtStart, dtEnd) {
    $("#dtStart").datepicker("setDate", dtStart);
    $("#dtEnd").datepicker("setDate", dtEnd);
}

function SetLunaCurenta() {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59);

    setDate(firstDay, lastDay);
}

function lpad  (val,padString, length) {
    var str = val;
    while (str.length < length)
        str = padString + str;
    return str;
}

function getDateString(control) {
    try {
        return ($("#" + control).data('datepicker').getDate().getFullYear().toString() + "-" + lpad($("#" + control).data('datepicker').getDate().getDate().toString(), "0", 2) + "-" + lpad(""+($("#" + control).data('datepicker').getDate().getMonth() + 1).toString(),"0",2));
    } catch (ex) {
    }
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
             ? Math.ceil(from)
             : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}


function pushHistoryState(uri, text) {
    if (window.history.pushState) {
        window.history.pushState({ path: uri, title: text }, text, uri);
    }
    else {
        storedHash = uri;
        location.hash = uri;
    }

}

var timeT = null;
var nr = 0;
function navigateItemAjax(url, title,th) {
    try {
        title = title.replace("_", " ");
        if (title =="Produse comandate stoc 0") {
            url += '?FaraStoc=1';
        }
        timeT = new Date();
        if (!url)
            return false;
        if (getIdDistribuitor() > 0) {

            url += (url.indexOf("?")>=0 ? "&" : "?") + "idDistribuitor=" + getIdDistribuitor();
            
        }
        pushHistoryState(url, url);
        var onFinish = function (data) {
            setControls();      
            nrContent++;
            scope.result = data + "<div style='display:none'>" + nrContent + "</div>";

            scope.$apply();
        };      
        var method = "GET";      
        $.ajax({
            url: url,
            cache: false,
            type: method,
            beforeSend: function (xhr) {
                ShowLoading();
            },
            complete: function (s, status) {
                HideLoading();
                if (status != 'success')
                    onFinish('<h2>Eroare la incarcarea paginii!</p>');
                $("#liTitle").html(title);
            },
            success: function (data, status, xhr) {
                nr++;
                onFinish(data);

            }
        });
    } catch (ex) {
    }
    return true;
}

function isDefined(object) {
    return object !== undefined && object !== null;
}

function isNotEmpty(string) {
    return isDefined(string) && string.length > 0;
}

 
function updateUrlParam(name, value) {
    // Get the path and the query
    var urlInfo = decodeURI(window.location.href).split('?');
    var path = urlInfo[0];
    var query = urlInfo[1];

    // Build the query
    var params = '';
    var anchor = null;
    if (isNotEmpty(query)) {
        var queryInfo = query.split('#');
        query = queryInfo[0];
        anchor = queryInfo[1];

        queryInfo = query.split('&');
        for (var i = 0; i < queryInfo.length; ++i) {
            if (queryInfo[i].split('=')[0] !== name) {
                params += '&' + queryInfo[i];
            }
        }
    } else {
        var queryInfo = path.split('#');
        query = queryInfo[0];
        anchor = queryInfo[1];
        if (isNotEmpty(query)) {
            path = query;
        }
    }
    query = '?' + name + '=' + value + params;
    if (isNotEmpty(anchor)) {
        query += '#' + anchor;
    }
    window.history.replaceState('', '', encodeURI(path + query));
}

function formatDateObject(obj) {
    var newOb = null;
    angular.forEach(obj, function (column, index) {

        if (column != undefined) {
            if (column.indexOf != undefined && column.indexOf("/Date(") != -1) {
                
                obj[index] = moment(column).toDate();
            }

            if (angular.isObject(column) === true) {
                if (column.Key != null) {
                    if (newOb == null) {
                        newOb = {};
                    }
                    newOb[column.Key] = column.Value;
                }
                else {
                    formatDateObject(column);
                }
            }
        }
    });
    return newOb != null ? newOb : obj;
}

function setPropertiesObject(object, prop, value) {
    var str = prop.split(".");
    var i = 0;
    if (object == null) {
        object = new Object();
    }
    angular.forEach(str, function (column, index) {

        if (i < str.length - 1) {
            if (object[column]==null) {
                object[column] = new Object();
            }
            object = object[column];
            i++;
        }
    });

    object[str[i]] = value;
}

app.filter('myFilter', function () {
    return function (inputs, filterValues) {
        var output = [];
        angular.forEach(inputs, function (input) {
            if (filterValues.value.indexOf(input[filterValues.id]) !== -1)
                output.push(input);
        });
        return output;
    };
});

var chatWin = null;
function myOpenWindow(winURL, winName, winFeatures, winObj) {
    var theWin; // this will hold our opened window
    if (winObj != null) {
        if (!winObj.closed) {
            winObj.focus();
            return winObj;
        }
    }
    theWin = window.open(winURL, winName, winFeatures);
    return theWin;
}

Number.prototype.format = function (n, x, s, c) {

    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};


Number.prototype.c2 = function () {
    return this.format(2, 3, '.', ',') + " RON";
};


function getDistribuitor() {
     
    return document.getElementById("cmbDistribuitor").value;
}


function getIsModify() {

   return  $("#cmbDistribuitor option:selected").attr("data-modifica");
   
}

function setNomenEdit(grid,scope) {
    var nomen = getIsModify() == "True" ? true : false;
    grid.options.isImport = nomen;
    grid.options.showMod = nomen;
    grid.options.showRem = nomen;
    scope.modifica = nomen;
}

function getIdDistribuitor() {
    
    return (ExistaDistribuitor() && $('#dDistribuitori').val() != null && $('#dDistribuitori').val()!="") ? $('#dDistribuitori').val() : ((getUrlVars()["idDistribuitor"] != null && "" + getUrlVars()["idDistribuitor"] != "" ? (getUrlVars()["idDistribuitor"]).replace("#","") : 0));
}

function getIsShop() {
   return $("#dDistribuitori option:selected").attr("data-shop")=="True"?true:false;
}

function doarVizualizare() {

    if (!ExistaDistribuitor())
        return false;   
    var puncteLucru = JSON.parse($("#dDistribuitori option:selected").attr("data-punctelucru"));
    if (puncteLucru["" + GetClient().IdPunctLucru] == 1) {
        return true;
    }
    return false;
}

function AccesPunctLucru(idDistribuitor, idPunctLucru) {
    if ($("#divDisC").css('display')=="none") {
        return true;
    }
    var tag = JSON.parse($("#dDistribuitori option[value=" + idDistribuitor + "]").attr('data-punctelucru'));
    if (tag != null) {      
        return tag[idPunctLucru]!=null;
    }
    return true;
}

function ExistaDistribuitor() {
    
    return   $('#dDistribuitori').length ? true : false;
}


function ExistaPunctLucru() {
    return $('#cmbPunctLucru').length ? true : false;
}

var idDistribuitorCerere;
var autorizatieFunctionare = false;
function showDeblocheaza(idDistribuitor) {
    idDistribuitorCerere = idDistribuitor;
    var data = JSON.stringify({
        idDistribuitor: idDistribuitor,
  
    });
    ShowLoading();
    $.ajax({
        type: "POST",
        url: "/Sessionless/VerificareProprietatiDistribuitor",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {

            autorizatieFunctionare = msg.AutorizatieFunctionare;
            if (msg.CreareUtilizatorBTB == true) {
                $("#CreareUtilizatorBTB").prop("checked", true);
                $("#divCreareUtilizatorBTB").show();
            }
            else {
                $("#divCreareUtilizatorBTB").hide();
                $("#CreareUtilizatorBTB").prop("checked", false);
            }
            if (!autorizatieFunctionare || msg.Status == 3) {
                if (!autorizatieFunctionare)
                    alertConfirm("Distribuitorul " + msg.NumeDistribuitor + " solicita autorizatia de functionare inaintea trimiterii cererii de acces. O puteti atasa la nivel de punct de lucru din fereastra Administrare>Date firma. Doriti sa o faceti acum?", function () { location.href = "/Pharmacies/Home/NewPharmacy?idClient=" + msg.IdClient; }, "Da");
                else
                    alertSucces(NuPutetiTrimiteCerereDeAccesDistribuitorul + " " + msg.NumeDistribuitor + " " + EsteInCursDeImplementare)
            }
            else {
                $("#idDisM").html(msg.NumeDistribuitor + "?");
                $("#myModalCerereAcces").modal("show");
            }
        },
        complete: function () {

            HideLoading();
        },
        error: function (xhr, ajaxOptions, thrownError, aa) {
           
        }
    });
  
}

function isNewUpdate(acces) {
    $.ajax({
        type: "POST",
        url: "/Account/LastUpdate",
      
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            acces(msg);
        },
        complete: function () {
           
        },
        error: function (xhr, ajaxOptions, thrownError, aa) {
            acces(-1);
        }
    });
}

function deblocheaza() {
     var data = JSON.stringify({
            idDistribuitor: idDistribuitorCerere,
            idPunctLucru: ExistaPunctLucru() ? GetClient().IdPunctLucru : null,
            CreareUtilizatorBTB: $("#CreareUtilizatorBTB").prop("checked")
        });
        ShowLoading();
        $.ajax({
            type: "POST",
            url: "/Sessionless/CerereDeblocareDistribuitor",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (msg) {
                alertSucces("Cererea a fost trimisa cu succes! Veti primi un e-mail de confirmare cand vi se va acorda acces.", function () { redirectHome();});
            },
            complete: function () {
                $("#myModalCerereAcces").modal("hide");
                HideLoading();
            },
            error: function (xhr, ajaxOptions, thrownError, aa) {
                alertErorr("Eroare la trimitere cerere acces distribuitor!", function () { redirectHome();});
            }
        });
   
}

function redirectHome() {
    $('#dDistribuitori').val(0);
    updateUrlParam("idDistribuitor", '');
   
    navigateItemAjax("/Pharmacies/Home/Index", "",null);
}

function SetDistribuitori() {
    $("#dDistribuitori").html($("#dDistribuitori").html()).chosen({
        placeholder_text_single: SelectatiUnDistribuitor + " " + Distribuitor,
        html_template_selected: '<img  style=" width:83px;height:50px; vertical-align:middle  !important; padding:0px;margin-right:0px;margin-left:0px;margin-top:0px"   src="{url}">',
        html_template: ' <img  style=" width:100px; vertical-align:middle !important;height:50px; !important; padding:0px;margin-right:0px;margin-top:0px"   src="{url}"> <button onclick="showDeblocheaza({val});"  class="btn btn-outline-primary btn-xs text-primary"  style=" float:right; ;margin-top:8px;  display:none;  " value="{text}">' + Trimite + '</button> '
    });
}

function SetDistribuitoriAcces(change) {
    var nrEnabled = 0;
    if (ExistaDistribuitor()) {
        var idPunctLucru = ExistaPunctLucru() ? parseInt(GetClient().IdPunctLucru) : 0;
        var idDistribuitor = $('#dDistribuitori').val();
       
        var resetDistribuitor = false;
       
        var firstIdDistribuitor = null;
        $("#dDistribuitori > option").each(function () {

            var isVisible = true;
            if (clientType != "GoPharma" || role == "AgentVanzari" || role == "OTS") {
                nrEnabled = 1;
                isVisible = false;
            }
            else {
                var array = JSON.parse($(this).attr("data-punctelucru"));

                if (idPunctLucru == 0) {

                    if ($(this).attr("data-punctelucru").length > 2) {
                        isVisible = false;
                    }
                }
                else {

                    if (array["" + idPunctLucru] != undefined) {

                        isVisible = false;
                    }
                }
                if (change && isVisible == true && ("" + idDistribuitor) == ("" + this.value)) {
                    resetDistribuitor = true;
                }

                $(this).attr("data-button-visible", isVisible ? "True" : "False");
                if (!isVisible) {
                    firstIdDistribuitor = this.value;
                    nrEnabled++;
                }
            
                $(this).attr("disabled", isVisible);
            }          
        });
        SetDistribuitori();
        if (resetDistribuitor == true || $("#dDistribuitori_chosen a").attr("class") == "chosen-single chosen-default") { 
            
            $("#dDistribuitori").val("").trigger("chosen:updated");
        }
        else {
           
            if (idDistribuitor != null) {
            
                $("#dDistribuitori").val(idDistribuitor).trigger("chosen:updated");          
            }         
        }      
        SetTextDistribuitor(change == false && nrEnabled != 1);
    }   
    return nrEnabled;
    
}

function SetTextDistribuitor(nochange) {
    var selected = $("#dDistribuitori option:selected");
    if (selected != null && selected.text() != "") {
        var valoareMinima = selected.attr('data-valoareminima');
        var mesajetitlu = selected.attr('data-tit');
        var mesajepop = selected.attr('data-pop');
        if (mesajepop != null && mesajepop != "" && nochange == false) {
            alertSucces(mesajepop);
        }
        $("#lblDistribuitor").html(selected.text() + " " + (valoareMinima != null && valoareMinima != "" ? " - Valoare minima comanda " + valoareMinima + " lei." : "") + " "+mesajetitlu);
    }
    else {
        $("#lblDistribuitor").html("");        
    }

    if ($("#hdIdDistribuitor")) {
        $("#hdIdDistribuitor").val(selected.val());
    } 
}

function getIdComanda() {
    return getUrlVars()["id"] != null ? getUrlVars()["id"] : 0;
}

function RedirectPage(url) {
    var id = getIdDistribuitor();
    var idPunctLucru = null;
    var idContract = null;
    if (localStorage.getItem("idPunctLucru" + "_" + getIdComanda() + username) != null && localStorage.getItem("idPunctLucru" + "_" + getIdComanda() + username) != "null") {
        idPunctLucru = localStorage.getItem("idPunctLucru" + "_" + getIdComanda() + username);
    }
    if (localStorage.getItem("idContract" + "_" + getIdComanda()) != null && localStorage.getItem("idContract" + "_" + getIdComanda()) != "null") {
        idContract = localStorage.getItem("idContract" + "_" + getIdComanda());
    }
    location.href = url + '' + (id > 0 ? "?idDistribuitor=" + id : '') + (idPunctLucru != null ? ((id > 0 ? "&" : "?") + "idPunctLucru=" + idPunctLucru + (idContract != null&&idContract!="null" ? '&idContract=' + idContract:'')) : "");
}


String.prototype.lpad = function (padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

function GetSetariUser(end) {
    ShowLoading();
    $.ajax({
        async: false,
        url: "/Pharmacies/Home/GetSetariUser"
    })
        .success(function (result) {
            HideLoading();
            end(result);
        });
}
