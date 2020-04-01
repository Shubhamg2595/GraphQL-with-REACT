import React from 'react';
import AuthContext from '../../../../context/auth-context'
import './EventItem.css';

const EventItem = props => (
    <AuthContext.Consumer>
        {
            (context) => {

                return (
                    <li key={props.eventId} className="events__list-item">
                        <div>
                            <h1>
                                {props.title}
                            </h1>
                            <h2>${props.price} -- {new Date(props.date).toLocaleDateString()}</h2>
                        </div>
                        <div>
                            {context.userId === props.creatorId ? <p> You are the owner of this event </p> : <button className="btn">View Details</button>}


                        </div>

                    </li>
                )
            }
        }
    </AuthContext.Consumer>
)


export default EventItem;