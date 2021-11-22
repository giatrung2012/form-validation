// Constructor
function Validator(options) {
  function getParent(elm, selector) {
    while (elm.parentElement) {
      if (elm.parentElement.matches(selector)) {
        return elm.parentElement;
      }
      elm = elm.parentElement;
    }
  }

  const selectorRules = {};

  // Handle validate event
  function validate(inputElm, rule) {
    const errorElm = getParent(
      inputElm,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    let errorMsg;

    // Get rules from selector
    const rules = selectorRules[rule.selector];

    // Loop each rule & check
    for (let i = 0; i < rules.length; i++) {
      switch (inputElm.type) {
        case 'radio':
        case 'checkbox':
          errorMsg = rules[i](
            formElm.querySelector(rule.selector + ':checked')
          );
          break;
        default:
          errorMsg = rules[i](inputElm.value);
      }
      if (errorMsg) break;
    }

    if (errorMsg) {
      errorElm.innerText = errorMsg;
      getParent(inputElm, options.formGroupSelector).classList.add('invalid');
    } else {
      errorElm.innerText = '';
      getParent(inputElm, options.formGroupSelector).classList.remove(
        'invalid'
      );
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
          // In case submit with js or default behavior
          if (typeof options.onSubmit === 'function') {
            const enableInputs = formElm.querySelectorAll('[name]');
            const formValues = Array.from(enableInputs).reduce(
              (values, input) => {
                switch (input.type) {
                  case 'radio':
                  case 'checkbox':
                    values[input.name] = formElm.querySelector(
                      `[name="${input.name}"]:checked`
                    ).value;
                    break;
                  default:
                    values[input.name] = input.value;
                }

                return values;
              },
              {}
            );
            options.onSubmit(formValues);
          } else {
            formElm.submit();
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

      const inputElms = formElm.querySelectorAll(rule.selector);

      Array.from(inputElms).forEach((inputElm) => {
        inputElm.onblur = () => {
          validate(inputElm, rule);
        };

        inputElm.oninput = () => {
          const errorElm = getParent(
            inputElm,
            options.formGroupSelector
          ).querySelector(options.errorSelector);
          errorElm.innerText = '';
          getParent(inputElm, options.formGroupSelector).classList.remove(
            'invalid'
          );
        };

        inputElm.onchange = () => {
          if (inputElm.value !== null) {
            validate(inputElm, rule);
          } else {
            const errorElm = getParent(
              inputElm,
              options.formGroupSelector
            ).querySelector(options.errorSelector);
            errorElm.innerText = '';
            getParent(inputElm, options.formGroupSelector).classList.remove(
              'invalid'
            );
          }
        };
      });
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
