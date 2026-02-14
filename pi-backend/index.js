import http from 'http';

const PORT = 3000;

let latestTelemetry = null;
let test;
const server = http.createServer((req, res) => {
	// 1. GET request
	if (req.method === 'GET' && req.url === '/api/telemetry/latest') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(latestTelemetry ?? { error: 'No data yet' }));

		return;
	};

	// 2. POST request TEST
	if (req.method === 'POST' && req.url === '/api/telemetry') {
		let body = '';

		req.on('data', (chunk) => {
			body += chunk;
		});

		req.on('end', () => {
			try {
				const parsed = JSON.parse(body);

				latestTelemetry = parsed;

				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ 'ok': true, 'error': null }));
			} catch(err) {
				res.writeHead(400, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ 'ok': false, 'error': 'Invalid JSON' }));
			};
		});

		return;
	};

	// 3. Fallback
	res.writeHead(404, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ 'error': '404 not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running smoofly at http://localhost:${PORT}/`);
});
