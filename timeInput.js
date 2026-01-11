class TimeInput extends HTMLElement {
    setCustomValidity(message) {
        if (this.input && this.input.setCustomValidity) {
            this.input.setCustomValidity(message);
        }
    }

    reportValidity() {
        if (this.input && this.input.reportValidity) {
            return this.input.reportValidity();
        }
        return true;
    }

    setAttribute(name, value) {
        if (this.input && this.input.setAttribute) {
            this.input.setAttribute(name, value);
        }
    }

    removeAttribute(name) {
        if (this.input && this.input.removeAttribute) {
            this.input.removeAttribute(name);
        }
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                input {
                    font-size: 1.5rem;
                    width: 5rem;
                    height: 2rem;
                    text-align: center;
                }
                input[validation-state="warning"] {
                    outline: 2px solid red;
                }
            </style>
            <input type="text" value="00:00" inputmode="numeric" />
        `;

        this.input = this.shadowRoot.querySelector("input");
    }

    connectedCallback() {
        if (this.hasAttribute("value")) {
            this.input.value = this.format(this.getAttribute("value"));
        }

        this.input.addEventListener("keydown", this.onKeyDown.bind(this));
        this.input.addEventListener("input", this.onInput.bind(this));
    }

    onKeyDown(e) {
        if (
            e.key === "Backspace" ||
            e.key === "Delete" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "Tab"
        ) {
            return;
        }

        if (!/\d/.test(e.key)) {
            e.preventDefault();
        }
    }

    onInput() {
        let digits = this.input.value.replace(/\D/g, "");
        digits = digits.slice(-4).padStart(4, "0");

        this.input.value = `${digits.slice(0, 2)}:${digits.slice(2)}`;
        if (this.input.value.match(/([0-1][0-9]|[2][0-3]):[0-5][0-9]/)) {
            this.input.setCustomValidity('');
        }
        else {
            this.input.setCustomValidity('Choose a valid time.');
        }
        // Emit value change event
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: this.input.value,
                bubbles: true
            })
        );
    }

    format(value) {
        const digits = value.replace(/\D/g, "").slice(-4).padStart(4, "0");
        return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }

    get value() {
        return this.input.value;
    }

    set value(val) {
        this.input.value = this.format(val);
    }
}

customElements.define("time-input", TimeInput);
