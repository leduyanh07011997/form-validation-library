
// Đối tượng validator
const Validator = options => {
    const selectorRules = {}
    const formElement = document.querySelector(options.form)
    //Hàm lấy thẻ cha của một element
    const getParentElement = (element,selector) => {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            } 
            element = element.parentElement
        }
    }
    //Hàm thực hiện validate
    const validate = (inputElement, rule) => {
        var parentElement = getParentElement(inputElement,options.formGroupSelector)
        var errorElement = parentElement.querySelector(options.errorElement);
        var rules = selectorRules[rule.selector];
        var errorMessage

        for(i=0;i<rules.length;++i) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
                }
            if(errorMessage) break
        }

        if(errorMessage) {
            errorElement.textContent = errorMessage
            parentElement.classList.add('invalid')
        } else {
            errorElement.textContent = ''
            parentElement.classList.remove('invalid')
        }

        return !!errorMessage
    }

    const onInput = (inputElement, rule) => {
        var parentElement = getParentElement(inputElement,options.formGroupSelector);
        var errorElement = parentElement.querySelector(options.errorElement);

        errorElement.textContent = ''
        parentElement.classList.remove('invalid')
    }
    if(formElement) {
        formElement.onsubmit = (e) => {            
            e.preventDefault()
            var isFormValid = true
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);

                var isValid = validate(inputElement,rule)
                if(isValid) {
                    isFormValid = false
                }
            })

            if(isFormValid) {
                if(typeof options.onSubmit === 'function' ) {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce((values,input) => {
                        switch(input.type) {
                            case 'checkbox':
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                if(input.matches(':checked')) {
                                    values[input.name].push(input.value)
                                }
                                break
                            case 'radio':
                                if(input.matches(':checked')) {
                                    values[input.name] = input.value
                                }
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    },{})
                    options.onSubmit(formValues)
                } else {
                    formElement.submit()
                }
            }
        }

        options.rules.forEach(rule => {
            
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(inputElement => {
                if(inputElement) {
                    //Xử lý trường hợp người dùng blur ra ngoài input
                    inputElement.onblur = () => {
                        validate(inputElement,rule)
                    }
    
                    //Xử lý khi người dùng nhập vào input
                    inputElement.oninput = () => {
                        onInput(inputElement,rule)
                    }
                } 
            })
        })
    }
}

// Định nghĩa rules
Validator.isRequired = (selector, message) => {
    return {
        selector,
        test: (values) => {
            return values ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = (selector, message) => {
    return {
        selector,
        test: (values) => {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(values) ? undefined : message || 'Email không hợp lệ'
        }
    }
}

Validator.minLength = (selector, min, message) => {
    return {
        selector,
        test: (values) => {
            return values.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmation = (selector, getConfirmValue, message) => {
    return {
        selector,
        test: (values) => {
            return values === getConfirmValue() ? undefined : message || 'Nhập chưa chính xác'
        }
    }
}