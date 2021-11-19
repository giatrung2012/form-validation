// Constructor
function Validator(options) {
  const selectorRules = {};

  // Handle validate event
  function validate(inputElm, rule) {
    const errorElm = inputElm.parentElement.querySelector(
      options.errorSelector
    );
    let errorMsg;

    // Get rules from selector
    const rules = selectorRules[rule.selector];

    // Loop each rule & check
    for (let i = 0; i < rules.length; i++) {
      errorMsg = rules[i](inputElm.value);
      if (errorMsg) {
        break;
      }
    }

    if (errorMsg) {
      errorElm.innerText = errorMsg;
      inputElm.parentElement.classList.add('invalid');
    } else {
      errorElm.innerText = '';
      inputElm.parentElement.classList.remove('invalid');
    }

    return !errorMsg;
  }

  // Get input element need validate
  let formElm = document.querySelector(options.form);

  if (formElm) {
    formElm = document.querySelector(options.form);

    if (formElm) {
      formElm.onsubmit = (e) => {
        e.preventDefault();

        let isFormValid = true;

        // Loop each rules & validate
        options.rules.forEach((rule) => {
          const inputElm = formElm.querySelector(rule.selector);
          const isValid = validate(inputElm, rule);
          if (!isValid) {
            isFormValid = false;
          }
        });

        if (isFormValid) {
          if (typeof options.onSubmit === 'function') {
            const enableInputs = formElm.querySelector('');

            options.onSubmit();
          }
        }
      };
    }

    // Loop each rules & handle
    options.rules.forEach((rule) => {
      // Save rules for each input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElm = formElm.querySelector(rule.selector);

      if (inputElm) {
        inputElm.onblur = () => {
          validate(inputElm, rule);
        };

        inputElm.oninput = () => {
          const errorElm = inputElm.parentElement.querySelector(
            options.errorSelector
          );
          errorElm.innerText = '';
          inputElm.parentElement.classList.remove('invalid');
        };
      }
    });
  }
}

// Define the rules
// 1. When error => return msg
// 2. When success => not return
Validator.isRequired = (selector, msg) => {
  return {
    selector: selector,
    test: (value) => (value ? undefined : msg || 'Vui lòng nhập trường này'),
  };
};

Validator.isEmail = (selector, msg) => {
  return {
    selector: selector,
    test: (value) => {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : msg || 'Email không hợp lệ';
    },
  };
};

Validator.minLength = (selector, min, msg) => {
  return {
    selector: selector,
    test: (value) =>
      value.length >= min
        ? undefined
        : msg || `Vui lòng nhập tối thiểu ${min} ký tự`,
  };
};

Validator.isConfirmed = (selector, getConfirmValue, msg) => {
  return {
    selector: selector,
    test: (value) =>
      value === getConfirmValue()
        ? undefined
        : msg || 'Giá trị không chính xác',
  };
};
