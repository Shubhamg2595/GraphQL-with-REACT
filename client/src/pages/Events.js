import React, { Component } from 'react';
import './Events.css';
import Modal from '../components/Modal/Modal';
import BackDrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';

class EventsPage extends Component {


    state = {
        creating: false,
        events: [],
        isloading: false,
        selectedEvent: null,
    }

    isActive = true;


    static contextType = AuthContext;


    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }

    componentDidMount() {
        this.fetchEvents();
    }

    createEventHandler = () => {
        this.setState({ creating: true })
    }

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedEvent: null })
    }

    modalConfirmHandler = () => {

        this.setState({ creating: false })

        const title = this.titleElRef.current.value;
        const price = +this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.titleElRef.current.value;

        if (title.trim().length === 0 ||
            price <= 0 ||
            date.trim().length === 0 ||
            description.trim().length === 0
        ) {
            return;
        }

        const event = { title, price, date, description };
        console.log(event);

        const requestBody = {
            query: `
            mutation {
                createEvent(
                    eventInput:
                     {
                         title: "${title}",
                         price: ${price},
                         date: "${date}",
                         description: "${description}"
                     }
                     )
                {
                   _id 
                   title
                   description
                   date
                   price
                }
            }
            `
        }



        const token = this.context.token;

        fetch('http://localhost:3001/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed');
                }
                return res.json();
            }
            )
            .then(resData => {
                this.setState(prevState => {
                    const updatedEvents = [...prevState.events];
                    updatedEvents.push({
                        _id: resData.data.createEvent._id,
                        title: resData.data.createEvent.title,
                        description: resData.data.createEvent.description,
                        date: resData.data.createEvent.date,
                        price: resData.data.createEvent.price,
                        creator: {
                            _id: this.context.userId
                        }

                    });
                    return { events: updatedEvents }
                })
            })
            .catch(err => {
                console.log('[ERROR IN USER SIGNUP]', err);
            })

    }

    fetchEvents() {

        this.setState({ isloading: true });
        const requestBody = {
            query: `
            query {
                events                 
                {
                   _id 
                   title
                   description
                   date
                   price
                   creator {
                       _id
                       email
                   }
                }
            }
            `
        }
        fetch('http://localhost:3001/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed');
                }
                return res.json();
            }
            )
            .then(resData => {
                const events = resData.data.events;
                if (this.isActive) {
                    this.setState({ events: events, isloading: false });

                }
            })
            .catch(err => {
                console.log('[ERROR IN USER SIGNUP]', err);
                if (this.isActive) {
                    this.setState({ isloading: false });
                }
            })

    }

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return { selectedEvent: selectedEvent }
        });
    }

    bookEventHandler = () => {
        if (!this.context.token) {
            this.setState({ selectedEvent: null });
            return;
        }
        const requestBody = {
            query: `
            mutation {
                bookEvent(eventId : "${this.state.selectedEvent._id}" )              
                {
                   _id 
                    createdAt
                    updatedAt
                }
            }
            `
        }
        fetch('http://localhost:3001/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.context.token}`
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed');
                }
                return res.json();
            }
            )
            .then(resData => {
                console.log('reData', resData);
                this.setState({ selectedEvent: null });
            })
            .catch(err => {
                console.log('[ERROR IN USER SIGNUP]', err);
            })



    }

    componentWillUnmount() {
        this.isActive = false;
    }

    render() {

        return (
            <>
                {(this.state.creating || this.state.selectedEvent) && <BackDrop />}
                {this.state.creating && (
                    <Modal
                        title="Add Event"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                        confirmText="Confirm"
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="title"> Title </label>
                                <input type="text" id="title" ref={this.titleElRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="price"> price </label>
                                <input type="number" id="price" ref={this.priceElRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="date"> Date </label>
                                <input type="datetime-local" id="date" ref={this.dateElRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="description"> description </label>
                                <textarea rows="$" id="description" ref={this.descriptionElRef} />
                            </div>


                        </form>
                    </Modal>
                )}

                {this.state.selectedEvent && (
                    <Modal
                        title={this.state.selectedEvent.title}
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.bookEventHandler}
                        confirmText={this.context.token ? "Book Event" : "Confrim"}

                    >
                        <h1>{this.state.selectedEvent.title}</h1>
                        <h2>
                            ${this.state.selectedEvent.price} -- {new Date(this.state.selectedEvent.date).toLocaleDateString()}
                        </h2>
                        <p>{this.state.selectedEvent.description}</p>

                    </Modal>

                )}

                {this.context.token && (
                    <div className="events-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={this.createEventHandler}>Create Event</button>
                    </div>
                )}
                {this.state.isloading ?
                    <Spinner /> :
                    <EventList
                        events={this.state.events}
                        onViewDetail={this.showDetailHandler}
                    />
                }

            </>
        )
    }
}

export default EventsPage;