const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.resolveSrv('_mongodb._tcp.cluster0.9wtcshj.mongodb.net', (err, addresses) => {
    if (err) {
        console.error("DNS Error:", err);
    } else {
        console.log("Resolved Hosts:", addresses);
        addresses.forEach(a => {
            dns.resolve(a.name, (err, ips) => {
                console.log(a.name, "->", ips);
            });
        });
    }
});
