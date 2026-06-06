const { Router } = require('express');
const { globalSearch } = require('../controllers/search.controller');
const verifyJWT = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyJWT);
router.get('/', globalSearch);

module.exports = router;