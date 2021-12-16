
import { LightningElement,api } from 'lwc';

export default class Cb_Metadata_Edit extends LightningElement {
    @api type;
    @api value;
    @api modaltype;
    @api field;
    isString = false;
    isBoolean = false;
    isNumber = false;
    isDate = false;
    isError = false;
    isTextArea = false;
    disableField = false;
    oldValue;

    //set up fields based on selected type and value from parent
    connectedCallback(){
    this.isString = false;
    this.isBoolean = false;
    this.isNumber = false;
    this.isError = false;
    this.isDate = false;
    this.isTextArea = false;
    this.disableField = false;

    this.oldValue = this.value;
        if((this.field == "MasterLabel" || this.field == "DeveloperName") && this.modaltype != "new"){
            this.disableField = true;
        }
        switch (this.type) {
        case "STRING":
            this.isString = true;
            break;
        case "BOOLEAN":
            this.isBoolean = true;
            break;
        case "DOUBLE":
            this.isNumber = true;
            break;
        case "TEXTAREA":
            this.isTextArea = true;
            break;
            default:
            this.isError = true;
                break;
        }
    }

    handleChange(event){
        this.value = event.target.value;
        let changes = {field:this.field, value:this.value, type:this.type,old: this.oldValue};
        this.shootEvent('updatedfields',changes);
    }

    //update parent with changes.
    shootEvent(type,value){
        const selectedEvent = new CustomEvent(type, {
            detail : value
          });
        this.dispatchEvent(selectedEvent);
    }
}