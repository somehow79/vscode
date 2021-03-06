/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {$, Dimension} from 'vs/base/browser/builder';
import {QuickOpenModel} from 'vs/base/parts/quickopen/browser/quickOpenModel';
import {QuickOpenWidget} from 'vs/base/parts/quickopen/browser/quickOpenWidget';
import {IAutoFocus} from 'vs/base/parts/quickopen/common/quickOpen';
import {ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, OverlayWidgetPositionPreference} from 'vs/editor/browser/editorBrowser';

export interface IQuickOpenEditorWidgetOptions {
	inputAriaLabel: string;
}

export class QuickOpenEditorWidget implements IOverlayWidget {

	private static ID = 'editor.contrib.quickOpenEditorWidget';

	private codeEditor:ICodeEditor;
	private visible:boolean;
	private quickOpenWidget:QuickOpenWidget;
	private domNode:HTMLElement;

	constructor(codeEditor:ICodeEditor, onOk:()=>void, onCancel:()=>void, onType:(value:string)=>void, configuration:IQuickOpenEditorWidgetOptions) {
		this.codeEditor = codeEditor;

		this.create(onOk, onCancel, onType, configuration);
	}

	private create(onOk:()=>void, onCancel:()=>void, onType:(value:string)=>void, configuration:IQuickOpenEditorWidgetOptions):void {
		this.domNode = $().div().getHTMLElement();

		this.quickOpenWidget = new QuickOpenWidget(
			this.domNode,
			{
				onOk:onOk,
				onCancel:onCancel,
				onType:onType
			}, {
				inputPlaceHolder: null,
				inputAriaLabel: configuration.inputAriaLabel
			},
			null
		);

		this.quickOpenWidget.create();
		this.codeEditor.addOverlayWidget(this);
	}

	public setInput(model:QuickOpenModel, focus:IAutoFocus):void {
		this.quickOpenWidget.setInput(model, focus);
	}

	public getId(): string {
		return QuickOpenEditorWidget.ID;
	}

	public getDomNode():HTMLElement {
		return this.domNode;
	}

	public destroy():void {
		this.codeEditor.removeOverlayWidget(this);
		this.quickOpenWidget.dispose();
	}

	public isVisible():boolean {
		return this.visible;
	}

	public show(value:string):void {
		this.visible = true;

		var editorLayout = this.codeEditor.getLayoutInfo();
		if (editorLayout) {
			this.quickOpenWidget.layout(new Dimension(editorLayout.width, editorLayout.height));
		}

		this.quickOpenWidget.show(value);
		this.codeEditor.layoutOverlayWidget(this);
	}

	public hide():void {
		this.visible = false;
		this.quickOpenWidget.hide();
		this.codeEditor.layoutOverlayWidget(this);
	}

	public getPosition(): IOverlayWidgetPosition {
		if (this.visible) {
			return {
				preference: OverlayWidgetPositionPreference.TOP_CENTER
			};
		}

		return null;
	}
}