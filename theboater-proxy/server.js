const express = require("express");
const https = require("https");

const app = express();

app.get("/", async function (req, res) {
    console.log(new Date().toISOString() + " " + req.url);

    try {
        const nonce = await getNonce();
        const apiData = await getAPIData(nonce);

        res.write(apiData);
        res.end();
    }
    catch (e) {
        res.status(500);
        res.end();
    }
});

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`Listening on port ${port}`);

async function getNonce() {
    return new Promise((resolve, reject) => {
        const pageURL = "https://theboater.hk/sail/";

        https.get(pageURL, res => {
            const chunks = [];
            res.on("data", chunk => chunks.push(chunk));

            res.on("end", () => {
                const data = chunks.join("");
                const nonceMatch = /data-vc-public-nonce="([a-z0-9]+)"/.exec(data);
                if (nonceMatch) {
                    const nonce = nonceMatch[1];

                    resolve(nonce);
                }
                else {
                    reject();
                }
            });
        });
    });
}

async function getAPIData(nonce) {
    return new Promise((resolve, reject) => {
        const dataURL = "https://theboater.hk/wp-admin/admin-ajax.php";

        const req = https.request(dataURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }, res => {
            const chunks = [];
            res.on("data", chunk => chunks.push(chunk));

            res.on("end", () => {
                const data = chunks.join("");

                resolve(data);
            });
        });

        req.on("error", e => reject(e.message));

        req.write(`action=vc_get_vc_grid_data&vc_action=vc_get_vc_grid_data&tag=vc_basic_grid&data%5Bvisible_pages%5D=5&data%5Bpage_id%5D=396&data%5Bstyle%5D=all&data%5Baction%5D=vc_get_vc_grid_data&data%5Bshortcode_id%5D=1543375048423-0aad29e1-ef79-7&data%5Btag%5D=vc_basic_grid&vc_post_id=396&_vcnonce=${nonce}`);

        req.end();
    });
}