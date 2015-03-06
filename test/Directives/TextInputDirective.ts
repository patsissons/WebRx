﻿/// <reference path="../typings/jasmine.d.ts" />
/// <reference path="../typings/jasmine-jquery.d.ts" />
/// <reference path="../TestUtils.ts" />
/// <reference path="../../build/web.rx.d.ts" />

describe('Directives', () => {
    describe('TextInput',() => {
        it('attempting to bind to other elements than input and textarea throws',() => {
            loadFixtures('templates/Directives/TextInput.html');

            var model = {
                text: wx.property("foo")
            };

            var el = <HTMLInputElement> document.querySelector("#fixture3");

            expect(() => wx.applyDirectives(model, el)).toThrowError(/textInput directive can only be applied/);
        });

        it('Should treat null values as empty strings', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            testNode.innerHTML = "<input data-bind='textInput:myProp' />";
            expect(() => wx.applyDirectives({ myProp: wx.property(0) }, testNode)).not.toThrowError();
            expect(testNode.childNodes[0].value).toEqual("0");
        });

        it('Should assign an empty string as value if the model value is null', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            testNode.innerHTML = "<input data-bind='textInput:(null)' />";
            expect(() => wx.applyDirectives(null, testNode)).not.toThrowError();
            expect(testNode.childNodes[0].value).toEqual("");
        });

        it('Should assign an empty string as value if the model value is undefined', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            testNode.innerHTML = "<input data-bind='textInput:undefined' />";
            expect(() => wx.applyDirectives(null, testNode)).not.toThrowError();
            expect(testNode.childNodes[0].value).toEqual("");
        });

        it('For observable values, should unwrap the value and update on change', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            var myobservable = wx.property(123);
            testNode.innerHTML = "<input data-bind='textInput:someProp' />";
            expect(() => wx.applyDirectives({ someProp: myobservable }, testNode)).not.toThrowError();
            expect(testNode.childNodes[0].value).toEqual("123");
            myobservable(456);
            expect(testNode.childNodes[0].value).toEqual("456");
        });

        it('For observable values, should update on change if new value is \'strictly\' different from previous value', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            var myobservable = wx.property("+123");
            testNode.innerHTML = "<input data-bind='textInput:someProp' />";
            expect(() => wx.applyDirectives({ someProp: myobservable }, testNode)).not.toThrowError();
            expect(testNode.childNodes[0].value).toEqual("+123");
            myobservable(<any> 123);
            expect(testNode.childNodes[0].value).toEqual("123");
        });

        it('For writeable observable values, should catch the node\'s onchange and write values back to the observable', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            var myobservable = wx.property(123);
            testNode.innerHTML = "<input data-bind='textInput:someProp' />";
            expect(() => wx.applyDirectives({ someProp: myobservable }, testNode)).not.toThrowError();
            testNode.childNodes[0].value = "some user-entered value";
            testutils.triggerEvent(testNode.childNodes[0], "change");
            expect(myobservable()).toEqual("some user-entered value");
        });

        it('Should ignore node changes when bound to a read-only observable', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            var computedValue = Rx.Observable.return('zzz').toProperty();
            var vm = { prop: computedValue };

            testNode.innerHTML = "<input data-bind='textInput: prop' />";
            expect(() => wx.applyDirectives(vm, testNode)).not.toThrowError();
            expect(testNode.childNodes[0].value).toEqual("zzz");

            // Change the input value and trigger change event; verify that the view model wasn't changed
            testNode.childNodes[0].value = "yyy";
            testutils.triggerEvent(testNode.childNodes[0], "change");
            expect(vm.prop).toEqual(computedValue);
            expect(computedValue()).toEqual('zzz');
        });

        it('Should update observable on input event (on supported browsers) or propertychange event (on old IE)', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            var myobservable = wx.property(123);
            testNode.innerHTML = "<input data-bind='textInput: someProp' />";
            expect(() => wx.applyDirectives({ someProp: myobservable }, testNode)).not.toThrowError();
            expect(testNode.childNodes[0].value).toEqual("123");

            testNode.childNodes[0].value = "some user-entered value";   // setting the value triggers the propertychange event on IE
            if (!wx.env.ie || wx.env.ie.version >= 9) {
                testutils.triggerEvent(testNode.childNodes[0], "input");
            }
            expect(myobservable()).toEqual("some user-entered value");
        });

        it('Should write only changed values to observable', () => {
            loadFixtures('templates/Directives/TextInput.html');
            var testNode = <any> document.querySelector("#fixture");

            var model = { writtenValue: wx.property('') };

            testNode.innerHTML = "<input data-bind='textInput: writtenValue' />";
            expect(() => wx.applyDirectives(model, testNode)).not.toThrowError();

            testNode.childNodes[0].value = "1234";
            testutils.triggerEvent(testNode.childNodes[0], "change");
            expect(model.writtenValue()).toEqual("1234");

            // trigger change event with the same value
            model.writtenValue = undefined;
            testutils.triggerEvent(testNode.childNodes[0], "change");
            expect(model.writtenValue).toBeUndefined();
        });
    });
});