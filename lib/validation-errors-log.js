
/* eslint no-console: 0 */
module.exports = validationErrorsLog;

function validationErrorsLog(str, errors) {
  if (errors.length) {
    console.log(`\n\n${str}`);
    console.log('='.repeat(str.length));

    errors.forEach((msg, i) => {
      console.log(i, msg);
    });

    console.log('\n\n');
  }
}
