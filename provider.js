var Axios = require("axios")
var md5 = require("md5")


const providers = async (details) => {
    let { type, url, fields, fullUrl, accessToken, formData } = details

    if (!fullUrl) {
        url = "/" + url
    }


    let config = {
        headers: {

        }
    }
    if (formData) {

    }
    // console.log({accessToken});

    let requestDetails = config
    let res;
    if (type == "get" || type == "delete") {
        res = await Axios[type](`${url}`, config,)
            .catch((error) => {

                return {
                    ...error.response.data,
                    errorType: error.response.data.error,
                    error: true,
                }
            });
    } else {
        res = await Axios[type](`${url}`, fields, config,)
            .catch((error) => {

                let resData = error.response ? error.response.data : {}
                return {
                    ...resData,
                    errorType: resData.error,
                    error: true,
                }
            });
    }
    if (res.error) {
        return res
    } else {
        if (res.status === 304 || res.status === 200 ||
            res.status === 201 ||
            res.statusText === "OK"
        ) {
            return ({ error: false, result: res.data })
        } else {
            return { error: true, errorType: "connectionError" }
        }
    }
}

module.exports = providers;