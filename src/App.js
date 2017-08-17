import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { Tab, Tabs, Modal, Button } from 'react-bootstrap';

class DueDate extends Component {
    render() {
        var monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var d = new Date(this.props.dueDate);
        var myDate = monthArray[d.getUTCMonth() - 1] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
    
        return (
                <span>
                    due {myDate}
                </span>
        );
    }
}

class Home extends Component {
    render() {
        return (
            <div className="home">
                <div className="homeContent">select an assignment</div>
            </div>
        );
    }
}


class Assignments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assignments: null,
            id: this.props.match.params.id,
            submissions: {},
            activeTab: props.activeTab || 1,
        };
    }
    
    handleSelect(selectedTab) {
        console.log('selectedTab:', selectedTab);
        this.setState({
          activeTab: selectedTab
        });
    }
    getSubmissions(idx, article_id, creator_id) {
        let url = 'https://api.edmodo.com/assignment_submissions?assignment_id='+article_id+'&assignment_creator_id='+creator_id+'&access_token=12e7eaf1625004b7341b6d681fa3a7c1c551b5300cf7f7f3a02010e99c84695d';
	
		
        
        
        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((j) => {
            //console.log('j2 is ', j);
            var tmp = this.state.submissions;
            tmp[idx] = j;
            this.setState({submissions: tmp});
        }).catch((err) => {
            console.log('assignment error: ', err);
        });
        
    }

    onEnter(id) {
        this.setState({id: id}, () => {
            
            var tmp = localStorage.getItem('assignments');
            if (tmp) {
                var localAssignments = JSON.parse(tmp);
                this.setState({assignments: localAssignments, id: id});

                if (!this.state.submissions[id]) {
                    //call ajax
                    console.log('calling ajax');
                    this.getSubmissions(this.state.id, localAssignments[id].id, localAssignments[id].creator_id);
                }

            }
        });
        
    }
    
    
    componentDidMount() {
        this.onEnter(this.state.id);
    }
    
    componentWillReceiveProps(nextProps) {
        this.onEnter(nextProps.match.params.id);
    }
    
    render() {
        if (!this.state.assignments || !this.state.id) {
            return null;
        }
        var as = this.state.assignments[this.state.id];
        return (
            <div>
                <Tabs id="assignments" activeKey={this.state.activeTab} onSelect={this.handleSelect.bind(this)}>
                    <Tab eventKey={1} title="Assignments">
                        <h3>{as.title}</h3>
                        <p><DueDate dueDate={as.due_at} /></p>
                        <p>{as.description}</p>
                    </Tab>
                    <Tab eventKey={2} title="Submissions">
                        <Submissions {...this.state} />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

class Submissions extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            submissions: {}
        }
    }
    
    
    
    render() {
        var su = this.props.submissions[this.props.id];
        if (!su) {
            return null;
        }
        return (
            <div>
                <ul>
                {
                    su.map((value, idx) => {
                        var cid = 'submission_'+idx;
                        return <li key={idx}>
                            <div className="submission">
                            <input type="checkbox" id={cid} className="btnControl" />
                            <label htmlFor={cid}><img src={value.creator.avatars.small} /> {value.creator.first_name} {value.creator.last_name}</label>
                            <br />submission date: <DueDate dueDate={value.submitted_at} />
                            
                            
                            <p className="content">{value.content}</p>
                            </div>
                        </li>
                        
                    })
                }
                </ul>
            </div>
        );
    }
}



class App extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            assignments: null,
            submissions: {},
            showModal: false
        };
    }
    
    close() {
        this.setState({ showModal: false });
    }
    open() {
        this.setState({ showModal: true });
    }
    
    getAssignments() {
        let url = 'https://api.edmodo.com/assignments?access_token=12e7eaf1625004b7341b6d681fa3a7c1c551b5300cf7f7f3a02010e99c84695d';
        
        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((j) => {
            //console.log('j is ', j);
            var myArray = [];
            j.map((value, key) => {
                var obj = {};
                obj.id = value.id;
                obj.due_at = value.due_at;
                obj.creator_id = value.creator.id;
                obj.description = value.description;
                obj.title = value.title;
                
                myArray.push(obj);
                return true;
            });
            
            this.setState({assignments: myArray}, () => {
                console.log('set state done');
                localStorage.setItem('assignments', JSON.stringify(myArray));
                this.forceUpdate();
            });
        }).catch((err) => {
            console.log('assignment error: ', err);
        });
    }
    
    
    componentDidMount() {
        this.getAssignments();
    }
    
    
  addAssign(e) {
        e.preventDefault();
        if (!this.refs.id.value) {
            alert('id is missing');
            return;
        }
        if (!this.refs.due_at.value) {
            alert('due_at is missing');
            return;
        }
        if (!this.refs.creator_id.value) {
            alert('creator_id is missing');
            return;
        }
        if (!this.refs.description.value) {
            alert('description is missing');
            return;
        }
        if (!this.refs.title.value) {
            alert('title is missing');
            return;
        }
        var due_at = this.refs.due_at.value;
      
      
      
        var d = new Date(due_at);
        //d.setMonth(d.getMonth() + 1);
        console.log('date is ', d);
        var utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
      
        console.log('d2 is ', utcDate);
        var myArray = this.state.assignments;
        var obj = {};
        obj.id = this.refs.id.value;
        obj.due_at = d;
        obj.creator_id = this.refs.creator_id.value;
        obj.description = this.refs.description.value;
        obj.title = this.refs.title.value;

        myArray.push(obj);

        this.setState({assignments: myArray}, () => {
            this.close();
            console.log('set state done');
            localStorage.setItem('assignments', JSON.stringify(myArray));
            this.forceUpdate();
        });
  }
    
  render() {
      //console.log('state is ', this.state);
      
      if (!this.state.assignments) {
          return null;
      }
    return (
        <Router >
          <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <h1>Assignments</h1>
                </div>
            </div>

            <div className="row">
                <div className="col-md-4">
                    {
                        <ul>
                            { 
                                this.state.assignments.map((value, key) => {
                                    var url = '/assignment/' + key;
                                    return <li key={key}><h3><Link to={url} >{value.title}</Link></h3><p>due at <DueDate dueDate={value.due_at} /></p></li>
                                })
                            }
                        </ul>

                    }
                    
                    <div>
                    
                    <button onClick={this.open.bind(this)} className="form-control">Add Assignment</button>
                    <Modal show={this.state.showModal} onHide={this.close}>
                      <Modal.Header closeButton>
                        <Modal.Title>Modal heading</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <h4>Fill in the following form to add Assignment</h4>
                        <p>id: <input type="text" ref="id" value="11" /><br /><br />
                        due_at: <input type="text" ref="due_at" placeholder="2017-12-31" value="2017-12-31" /><br /><br />
                        creator_id: <input type="text" ref="creator_id" value="433" /><br /><br />
                        description: <input type="text" ref="description" value="more description" /><br /><br />
                        Title: <input type="text" ref="title" value="more title" /></p>


                      </Modal.Body>
                      <Modal.Footer>
                        <Button onClick={this.addAssign.bind(this)}>Submit Assignment</Button><Button onClick={this.close.bind(this)}>Close</Button>
                      </Modal.Footer>
                    </Modal>
                    </div>
                </div>
                <div className="col-md-8">
                    <Route exact={true} path="/" component={Home} />
                    <Route exact={true} path="/assignment/:id" component={Assignments}/>
                </div>
            </div>
          </div>
        </Router>
    );
  }
}

export default App;
