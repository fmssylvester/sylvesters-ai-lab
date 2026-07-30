module.exports = function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true, method: req.method }))
}
