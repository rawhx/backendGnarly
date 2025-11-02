const { ResponseError } = require("./response");

/**
 * Middleware validasi payload dinamis + nested array + enum
 * @param {Array} rules - array aturan validasi
 *        setiap item: { 
 *           field: 'nama_field', 
 *           required: true/false, 
 *           minLength: number, 
 *           isArray: true/false, 
 *           enum: [allowedValues], 
 *           nested: [rules]
 *        }
 */
const requestValidasi = (rules = []) => {
  return (req, res, next) => {
    const payload = req.body || {};
    const errors = [];

    rules.forEach(rule => {
      const value = payload[rule.field];

      // cek required
      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(`${rule.field}: wajib diisi`);
      }

      // cek enum
      if (rule.enum && value && !rule.enum.includes(value)) {
        errors.push(`${rule.field}: harus salah satu dari [${rule.enum.join(", ")}]`);
      }

      // cek minLength
      if (rule.minLength && value && value.length < rule.minLength) {
        errors.push(`${rule.field}: minimal ${rule.minLength} karakter`);
      }

      // cek array wajib
      if (rule.isArray && (!Array.isArray(value) || value.length === 0)) {
        errors.push(`${rule.field}: harus berupa array dan tidak kosong`);
      }

      // cek nested jika array
      if (rule.isArray && Array.isArray(value) && rule.nested) {
        value.forEach((item, index) => {
          rule.nested.forEach(nestedRule => {
            const nestedValue = item[nestedRule.field];

            if (nestedRule.required && (nestedValue === undefined || nestedValue === null || nestedValue === "")) {
              errors.push(`${rule.field}[${index}].${nestedRule.field}: wajib diisi`);
            }

            if (nestedRule.minLength && nestedValue && nestedValue.length < nestedRule.minLength) {
              errors.push(`${rule.field}[${index}].${nestedRule.field}: minimal ${nestedRule.minLength} karakter`);
            }

            if (nestedRule.enum && nestedValue && !nestedRule.enum.includes(nestedValue)) {
              errors.push(`${rule.field}[${index}].${nestedRule.field}: harus salah satu dari [${nestedRule.enum.join(", ")}]`);
            }
          });
        });
      }
    });

    if (errors.length > 0) {
      return ResponseError(res, 400, "request tidak valid", errors.join(", "));
    }

    next();
  };
};

module.exports = { requestValidasi };
