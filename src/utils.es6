import request from "request"

export async function getKatHTML() {
    return new Promise(function (resolve, reject) {
        request({uri: 'https://kat.cr/tv/', gzip: true, method: "GET"}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    })
}


