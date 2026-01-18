class Command {
  execute() {
    throw new Error('Command must implement execute()');
  }
  
  undo() {
    throw new Error('Command must implement undo()');
  }
}

class AddTextCommand extends Command {
  constructor(editor, text) {
    super();
    this.editor = editor;
    this.text = text;
  }

  execute() {
    this.editor.content += this.text;
  }

  undo() {
    this.editor.content = this.editor.content.slice(0, -this.text.length);
  }
}

class Editor {
  constructor() {
    this.content = '';
    this.history = [];
  }

  executeCommand(command) {
    command.execute();
    this.history.push(command);
  }

  undo() {
    const command = this.history.pop();
    if (command) command.undo();
  }
}

const editor = new Editor();
editor.executeCommand(new AddTextCommand(editor, 'Hello '));
editor.executeCommand(new AddTextCommand(editor, 'World!'));
console.log(editor.content);

editor.undo();
console.log(editor.content);
