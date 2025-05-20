module.exports.index = (req, res, lang, t) => {
    return {
      message: "Hello from IndexController.index",
      lang,
      timestamp: Date.now()
    };
  };
  