function httpRequest(type, headers, url, params, callback) {
        var queries = uriFromObject(params);
        if (type == "GET") {
                url += queries;
                params = null;
        } else {
                params = JSON.stringify(params);
        }
        var http = new XMLHttpRequest();
        http.open(type, url, true);
        for (key in headers){
                http.setRequestHeader(key, headers[key]);
        }
        http.onreadystatechange = function () {
                if (http.readyState == 4 && (http.status == 200 || http.status == 201)) {
                        callback(http);
                }
        }
        http.send(params);

}
/*Returns the URI string for an api request from an object containing paramters
 *and arguements. None of the paramters can be repeated and arguments are
 *assumed to be numbers or strings
 */
function uriFromObject(object) {
        var res = "";
        for (key in object) {
                res += encodeURIComponent(key) +"="+ encodeURIComponent(object[key]) + "&";
        }
        return res;
}
module.exports = {
        httpRequest: httpRequest,
        uriFromObject: uriFromObject
};