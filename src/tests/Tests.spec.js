import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Métricas personalizadas
export const getUsersDuration = new Trend('get_users_duration', true);
export const statusCodeOK = new Rate('status_code_ok');

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '25s', target: 35 },
    { duration: '25s', target: 55 },
    { duration: '25s', target: 55 },
    { duration: '25s', target: 70 },
    { duration: '25s', target: 90 },
    { duration: '25s', target: 100 },
    { duration: '25s', target: 150 },
    { duration: '25s', target: 200 },
    { duration: '25s', target: 240 },
    { duration: '25s', target: 255 },
    { duration: '40s', target: 300 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5700'],   
    http_req_failed: ['rate<0.12'],      
  },
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

export default function () {
  const url = 'https://reqres.in/api/users?page=2';

  const res = http.get(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  getUsersDuration.add(res.timings.duration);

  const ok = res.status === 200;
  statusCodeOK.add(ok);

  check(res, {
    'GET /api/users?page=2 – Status 200': () => ok,
  });
}
