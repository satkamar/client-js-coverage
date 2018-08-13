# client-js-coverage
Client side js coverage

# code-coverage-client

    This is the chrome extension where we can use for generate graphical report for manual testing.

# Features!

  - Easy and free to use.
  - Graphical report for each js and css file based on covered and uncovered code wise.
  - Report will be sent to configured email.

### Needs to be installed

* [node.js] - server side 
* [npm] - node package manager

### Installation

code-coverage-client requires [npm](https://nodejs.org/en/download/) and [Node.js](https://nodejs.org/en/download/) v4+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd ./work
$ npm i code-coverage-client@latest
$ cd node_modules/code-coverage-client
$ npm install 
$ node index.js
```

### Extension

Add the chrome extension in your updated chrome browser from : [ Here ](https://chrome.google.com/webstore/detail/css-and-js-code-coverage/gfdcbeanlpkgbkagoejiiojahaehhbno)

### Start debug mode
Kill all the chrome process:
- For windows, Open task manager and select the chrome process and Kill
- For ubuntu, killall google-chrome-stable
Open command promt
Navigate to the chrome.exe location
```sh
    cd c:\Program Files (x86)\Google\Chrome\Application>
```
Open the browser in remote-debug mode 
 ```sh
 chrome.exe remote-debugging-port=9222 
 ```
 (This will open the new chrome browser in debug mode)
 
Click on coverage icon in browser top right corner,  [image](https://drive.google.com/file/d/1OP-38HrCUegUCbgcvPcJgW2a8f3EBFHB/view?usp=sharing)

If user is not registered their email, user will be navigated to email registration page. If already registered, user can see above screen.

Enter the valid URL in input box : For example https://volute.education/

Click on start button, that will open new window with entered URL. 

Now user can start their manual testing. Once testing is completed then click on “Generate Report” 
Report will be sent to registered email.
Sample report: [Sample report](https://drive.google.com/file/d/0B_rUtDXAAWVhcld1MkozanFRcWhCMmhiQnNhMFJqazNCWlJB/view?usp=sharing)


### Todos
- Reports for only selected files

License
----

MIT

